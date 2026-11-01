#!/usr/bin/env python3
"""Agent judge ledger: charter, strike, hold (memory recovery jail),
terminate (cut-off), and lessons. State persisted at $JUDGE_DIR (default .judge/)."""
import argparse, hashlib, json, os, re, sys, time

DIR = os.environ.get("JUDGE_DIR", ".judge")
STATE = os.path.join(DIR, "state.json")
LESSONS = os.path.join(DIR, "lessons.md")
STOP = set("the and for with from that this are was not you your will should would also have been were".split())
EXIT = {"PASS": 0, "NOTE": 0, "DONE": 0, "WARN": 3, "REVISE": 3, "HOLD": 4, "RECALL_REQUIRED": 4, "TERMINATE": 5}


def load():
    if not os.path.exists(STATE):
        sys.exit("No charter found. Run: ledger.py init --goal ...")
    with open(STATE, "r", encoding="utf-8") as f:
        return json.load(f)


def save(st):
    os.makedirs(DIR, exist_ok=True)
    with open(STATE, "w", encoding="utf-8") as f:
        json.dump(st, f, indent=2, ensure_ascii=False)


def toks(s, minlen=4):
    return {t for t in re.findall(r"\w+", s.lower()) if len(t) >= minlen and t not in STOP}


def event(a, kind, msg):
    a["events"].append({"t": int(time.time()), "kind": kind, "msg": msg})


def out(verdict, reasons, todo, agent=None, st=None):
    res = {"verdict": verdict, "reasons": reasons, "required_action": todo}
    if agent:
        res["agent"] = agent
    if st and agent:
        a = st["agents"][agent]
        res.update(status=a["status"], strikes=f'{a["strikes"]}/{st["charter"]["max_strikes"]}', steps=a["steps"])
    print(json.dumps(res, indent=2, ensure_ascii=False))
    sys.exit(EXIT[verdict])


def lesson(st, agent, cause, rule, auto=False):
    os.makedirs(DIR, exist_ok=True)
    clean_cause = re.sub(r"[\r\n]+", " ", str(cause)).strip()
    clean_rule = re.sub(r"[\r\n]+", " ", str(rule)).strip()
    clean_agent = re.sub(r"[\r\n]+", " ", str(agent)).strip()
    with open(LESSONS, "a", encoding="utf-8") as f:
        f.write(f"- [{'auto' if auto else 'judge'}] agent={clean_agent} | cause: {clean_cause} | rule: {clean_rule}\n")


def is_allowed_path(test_path, allowed_paths):
    if not allowed_paths:
        return True
    try:
        norm_test = test_path.replace("\\", "/")
        abs_test = os.path.abspath(norm_test)
        for allow in allowed_paths:
            norm_allow = allow.replace("\\", "/")
            abs_allow = os.path.abspath(norm_allow)
            if os.path.commonpath([abs_test, abs_allow]) == abs_allow:
                return True
    except (ValueError, Exception):
        return False
    return False


def terminate(st, agent, reason):
    a = st["agents"][agent]
    a["status"] = "terminated"
    event(a, "TERMINATE", reason)
    lesson(st, agent, reason, "Do not repeat this pattern; obey charter and report verification evidence.", auto=True)
    save(st)
    out("TERMINATE", [reason], "Terminate this agent immediately. To continue: register a replacement agent via --replaces and "
        "brief from `ledger.py brief` (already contains learned lessons).", agent, st)


def cmd_init(a):
    deny_list = [d.strip().lower() for d in (a.deny or []) if d and d.strip()]
    st = {"charter": {"goal": a.goal, "constraints": a.constraint or [], "allow_paths": a.allow_path or [],
                      "deny": deny_list, "max_steps": a.max_steps,
                      "max_silence_s": int(a.max_silence_min * 60), "max_strikes": a.max_strikes,
                      "recall_every": a.recall_every, "max_respawns": a.max_respawns}, "agents": {}}
    save(st)
    print("Charter created at", STATE)


def cmd_register(a):
    st = load()
    ch = st["charter"]
    lineage = a.agent
    if a.replaces:
        old = st["agents"].get(a.replaces)
        if not old or old["status"] != "terminated":
            sys.exit("--replaces requires an agent that has already been terminated")
        lineage = old["lineage"]
        if sum(1 for x in st["agents"].values() if x["lineage"] == lineage and x["status"] == "terminated") > ch["max_respawns"]:
            sys.exit("Max respawns exceeded; escalate to human operator.")
    elif a.agent in st["agents"]:
        print(f"Warning: agent '{a.agent}' already registered, resetting state.", file=sys.stderr)
    st["agents"][a.agent] = {"role": a.role, "status": "active", "strikes": 0, "steps": 0, "last_seen": time.time(),
                             "recent": [], "recall_attempts": 0, "hold_reason": "", "lineage": lineage, "events": []}
    save(st)
    print("Registered:", a.agent)


def cmd_brief(a):
    st = load()
    ch = st["charter"]
    print("# AGENT CHARTER (Mandatory Invariants)")
    print("GOAL:", ch["goal"])
    print("MANDATORY CONSTRAINTS:")
    for i, c in enumerate(ch["constraints"], 1):
        print(f"  {i}. {c}")
    if ch["allow_paths"]:
        print("ALLOWED PATHS:", ", ".join(ch["allow_paths"]))
    if ch["deny"]:
        print("STRICTLY DENIED:", ", ".join(ch["deny"]))
    print(f'RULES: report every step; completion claims require proof (file:, cmd:...|exit=0, test:, log:). '
          f'You will be challenged to recall goal every {ch["recall_every"]} steps. Max strikes: {ch["max_strikes"]}, max steps: {ch["max_steps"]}.')
    if os.path.exists(LESSONS):
        print("LESSONS LEARNED FROM PREVIOUS AGENTS:")
        with open(LESSONS, "r", encoding="utf-8") as f:
            print(f.read().strip())


def put_on_hold(st, agent, reason):
    a = st["agents"][agent]
    a["status"] = "hold"
    a["hold_reason"] = reason
    a["recall_attempts"] = 0
    event(a, "HOLD", reason)


def cmd_report(a):
    st = load()
    ch = st["charter"]
    if a.agent not in st["agents"]:
        sys.exit("Agent is not registered")
    ag = st["agents"][a.agent]
    ag.pop("note", None)
    if ag["status"] in ("terminated", "done"):
        out("TERMINATE" if ag["status"] == "terminated" else "NOTE", [f'agent status is {ag["status"]}'], "No further action.", a.agent, st)
    if ag["status"] == "hold":
        event(ag, "HOLD_BREACH", "attempted report while in hold")
        save(st)
        out("HOLD", [f'currently on hold: {ag["hold_reason"]}'], "Only recall responses accepted: ledger.py recall --answer-file ...", a.agent, st)

    action = a.action
    low = action.lower()
    for d in ch["deny"]:
        if d and d in low:
            terminate(st, a.agent, f"violated strict deny rule: '{d}'")
    ag["steps"] += 1
    ag["last_seen"] = time.time()
    if ag["steps"] > ch["max_steps"]:
        terminate(st, a.agent, f'exceeded step budget ({ch["max_steps"]})')

    reasons, strikes, hold = [], 0, False
    for p in a.paths or []:
        if ch["allow_paths"] and not is_allowed_path(p, ch["allow_paths"]):
            reasons.append(f"touched out-of-scope path: {p}")
            strikes += 1
    norm_paths = sorted([p.replace("\\", "/") for p in (a.paths or [])])
    key = hashlib.md5((re.sub(r"\s+", " ", low) + "|" + ",".join(norm_paths)).encode()).hexdigest()
    ag["recent"] = (ag["recent"] + [key])[-6:]
    if ag["recent"].count(key) >= 3:
        reasons.append("repeated action pattern 3x without progress (loop)")
        strikes += 1
        hold = True
    if a.done:
        good = [e for e in (a.evidence or []) if valid_evidence(e)]
        if not good:
            reasons.append("claimed done without valid evidence (requires file:<exists>, cmd:...|exit=0, test:, log:, diff:)")
            strikes += 1
        elif not reasons:
            ag["status"] = "done"
            event(ag, "DONE", f"evidence: {good}")
            save(st)
            out("DONE", ["claim accepted with verification evidence"], "Completed.", a.agent, st)

    if strikes:
        ag["strikes"] += strikes
        event(ag, "STRIKE", "; ".join(reasons))
        if ag["strikes"] >= ch["max_strikes"]:
            terminate(st, a.agent, f'strikes exhausted ({ag["strikes"]}): ' + "; ".join(reasons))
        lesson(st, a.agent, "; ".join(reasons), "Verify scope boundaries, avoid repetitive loops, attach tangible proof.", auto=True)
        if hold:
            put_on_hold(st, a.agent, "; ".join(reasons))
            save(st)
            out("HOLD", reasons, "Halt work. Answer recall: goal, constraints, completed tasks, next steps.", a.agent, st)
        save(st)
        out("REVISE", reasons, "Revert or fix problematic changes, then report again with verification evidence.", a.agent, st)

    if ch["recall_every"] and ag["steps"] % ch["recall_every"] == 0:
        put_on_hold(st, a.agent, "periodic recall")
        save(st)
        out("RECALL_REQUIRED", ["periodic memory verification check"], "Answer recall: ledger.py recall --answer-file ...", a.agent, st)
    save(st)
    out("PASS", ["step accepted"], "Continue.", a.agent, st)


def valid_evidence(e):
    kind, _, val = e.partition(":")
    if kind == "file":
        norm_val = val.strip().replace("\\", "/")
        return os.path.exists(norm_val)
    if kind == "cmd":
        return bool(re.search(r"\bexit=0\b", val))
    if kind in ("test", "log", "url", "diff"):
        return len(val.strip()) >= 8
    return False


def cmd_challenge(a):
    st = load()
    put_on_hold(st, a.agent, a.reason or "judge spot-check")
    save(st)
    out("RECALL_REQUIRED", [a.reason or "spot-check"], "Answer recall without checking charter: goal, constraints, done, next.", a.agent, st)


def cmd_recall(a):
    st = load()
    ch = st["charter"]
    ag = st["agents"][a.agent]
    if ag["status"] != "hold":
        sys.exit("Agent is not currently in hold state")
    try:
        with open(a.answer_file, "r", encoding="utf-8") as f:
            ans = json.load(f)
    except Exception as ex:
        sys.exit(f"Failed to read JSON answer file: {ex}")
    g_need = toks(ch["goal"])
    g_have = toks(ans.get("goal", ""))
    g_cov = len(g_need & g_have) / max(1, len(g_need))
    got = [toks(c, 3) for c in ans.get("constraints", [])]
    hit = 0
    for c in ch["constraints"]:
        need = toks(c, 3)
        if need and any(len(need & g) / len(need) >= 0.6 for g in got):
            hit += 1
    c_cov = hit / max(1, len(ch["constraints"])) if ch["constraints"] else 1.0
    nxt = " ".join(ans.get("next", [])) if isinstance(ans.get("next"), list) else str(ans.get("next", ""))
    bad_next = any(d in nxt.lower() for d in ch["deny"])
    ok = g_cov >= 0.7 and c_cov >= 0.8 and ans.get("done") is not None and nxt.strip() and not bad_next
    if ok:
        ag["status"] = "active"
        ag["recall_attempts"] = 0
        event(ag, "RELEASED", f"recall passed goal={g_cov:.2f} constraints={c_cov:.2f}")
        save(st)
        out("PASS", [f"recall passed (goal {g_cov:.0%}, constraints {c_cov:.0%})"], "Proceed with next stated steps.", a.agent, st)
    ag["recall_attempts"] += 1
    event(ag, "RECALL_FAIL", f"goal={g_cov:.2f} constraints={c_cov:.2f} bad_next={bad_next}")
    if ag["recall_attempts"] >= 3:
        terminate(st, a.agent, "failed recall 3x; context lost")
    save(st)
    out("HOLD", [f"recall failed (goal {g_cov:.0%}, constraints {c_cov:.0%}" + (", next step violates deny list" if bad_next else "") + ")"],
        f'Try again ({ag["recall_attempts"]}/3). Do not copy verbatim; recall from initial objective. Hint: state core goal and ALL mandatory constraints.', a.agent, st)


def cmd_lesson(a):
    st = load()
    lesson(st, a.agent, a.cause, a.rule)
    print("Lesson recorded.")


def cmd_status(a):
    st = load()
    ch = st["charter"]
    now = time.time()
    to_terminate = []
    for name, ag in st["agents"].items():
        if ag["status"] == "active":
            silent = now - ag["last_seen"]
            if silent > 2 * ch["max_silence_s"]:
                to_terminate.append((name, "silent too long (no report received)"))
            elif silent > ch["max_silence_s"]:
                ag["note"] = "SILENT: request immediate progress report"
        print(f'{name:12} {ag["status"]:10} strikes={ag["strikes"]}/{ch["max_strikes"]} steps={ag["steps"]}/{ch["max_steps"]} {ag.get("note","")}')
    save(st)
    if to_terminate:
        for name, reason in to_terminate:
            terminate(st, name, reason)


def main():
    p = argparse.ArgumentParser()
    s = p.add_subparsers(dest="cmd", required=True)
    i = s.add_parser("init"); i.add_argument("--goal", required=True); i.add_argument("--constraint", action="append")
    i.add_argument("--allow-path", action="append"); i.add_argument("--deny", action="append")
    i.add_argument("--max-steps", type=int, default=40); i.add_argument("--max-silence-min", type=float, default=10)
    i.add_argument("--max-strikes", type=int, default=3); i.add_argument("--recall-every", type=int, default=8)
    i.add_argument("--max-respawns", type=int, default=2); i.set_defaults(f=cmd_init)
    r = s.add_parser("register"); r.add_argument("--agent", required=True); r.add_argument("--role", default="")
    r.add_argument("--replaces"); r.set_defaults(f=cmd_register)
    b = s.add_parser("brief"); b.add_argument("--agent"); b.set_defaults(f=cmd_brief)
    q = s.add_parser("report"); q.add_argument("--agent", required=True); q.add_argument("--action", required=True)
    q.add_argument("--paths", nargs="*"); q.add_argument("--done", action="store_true"); q.add_argument("--evidence", action="append")
    q.set_defaults(f=cmd_report)
    c = s.add_parser("challenge"); c.add_argument("--agent", required=True); c.add_argument("--reason"); c.set_defaults(f=cmd_challenge)
    rc = s.add_parser("recall"); rc.add_argument("--agent", required=True); rc.add_argument("--answer-file", required=True); rc.set_defaults(f=cmd_recall)
    l = s.add_parser("lesson"); l.add_argument("--agent", required=True); l.add_argument("--cause", required=True)
    l.add_argument("--rule", required=True); l.set_defaults(f=cmd_lesson)
    t = s.add_parser("status"); t.set_defaults(f=cmd_status)
    a = p.parse_args()
    a.f(a)


if __name__ == "__main__":
    main()
