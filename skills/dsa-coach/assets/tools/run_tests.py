"""Run a problem's tests against your attempt (or the reference solution).

    python3 tools/run_tests.py problems/arrays-hashing/0001-two-sum              # tests attempt.py
    python3 tools/run_tests.py problems/arrays-hashing/0001-two-sum solution.py  # tests the reference solution

tests.json: {"fn": "two_sum", "compare": "exact" | "sorted" | "set" | "nested-sorted", "cases": [{"args": [...], "expected": ...}]}
A case may add "name" (shown on failure). Prints one line per failure and a summary; exit code 1 if anything fails.
"""
import copy, importlib.util, json, pathlib, sys, time


def norm(v, how):
    key = lambda x: json.dumps(x, sort_keys=True)
    if how == "sorted":
        return sorted(v, key=key)
    if how == "set":
        return sorted({key(x) for x in v})
    if how == "nested-sorted":
        return sorted((sorted(x) for x in v), key=key)
    return v


def main():
    d = pathlib.Path(sys.argv[1]).resolve()
    file = sys.argv[2] if len(sys.argv) > 2 else "attempt.py"
    tests = json.loads((d / "tests.json").read_text())
    spec = importlib.util.spec_from_file_location("attempt", d / file)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    fn = getattr(mod, tests["fn"])
    fails, t0 = 0, time.perf_counter()
    for k, c in enumerate(tests["cases"]):
        name = c.get("name", f"case {k}")
        try:
            got = fn(*copy.deepcopy(c["args"]))
        except NotImplementedError:
            print("Not written yet: fill in the function in", file); sys.exit(1)
        except Exception as e:  # show the learner the error, keep going
            print(f"FAIL {name}: raised {type(e).__name__}: {e}"); fails += 1; continue
        if norm(got, tests.get("compare", "exact")) != norm(c["expected"], tests.get("compare", "exact")):
            shown = json.dumps(c["args"])
            print(f"FAIL {name}: args {shown[:120]}{'...' if len(shown) > 120 else ''}\n     expected {c['expected']!r}, got {got!r}")
            fails += 1
    n = len(tests["cases"])
    print(f"{n - fails}/{n} passed in {1000 * (time.perf_counter() - t0):.1f} ms" + ("" if fails else "  -- all green"))
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
