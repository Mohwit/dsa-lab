"""Tries pattern lesson: every number on the page comes from this script.

Run:  python3 patterns/tries/measure.py

Counting rules (the page's JavaScript uses the same ones):
  scan comparisons = for each word, compare word[k] with prefix[k] for k = 0, 1, ... while both have a letter;
                     each comparison counts 1; stop at the first mismatch
  trie walk steps  = one per child lookup while walking the prefix (a failed lookup also counts 1)
  trie collect     = one per node visited below the prefix node while listing the matches
  build steps      = one per letter inserted (the cost of building the trie once)
  wildcard calls   = calls of dfs(node, i) in the wildcard search
Children are kept in insertion order (Python dict, JavaScript Map), so every walk visits them in the same order.
"""


class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False


class Trie:
    def __init__(self):
        self.root = TrieNode()
        self.nodes = 0
        self.build_steps = 0

    def insert(self, word):
        node = self.root
        for ch in word:
            self.build_steps += 1
            if ch not in node.children:
                node.children[ch] = TrieNode()
                self.nodes += 1
            node = node.children[ch]
        node.is_end = True

    def _walk(self, s):
        node, steps = self.root, 0
        for ch in s:
            steps += 1
            if ch not in node.children:
                return None, steps
            node = node.children[ch]
        return node, steps

    def search(self, word):
        node, _ = self._walk(word)
        return node is not None and node.is_end

    def starts_with(self, prefix):
        node, _ = self._walk(prefix)
        return node is not None

    def autocomplete(self, prefix):
        node, walk = self._walk(prefix)
        out, collect = [], 0
        if node is None:
            return out, walk, 0

        def dfs(n, path):
            nonlocal collect
            if n.is_end:
                out.append(path)
            for ch, child in n.children.items():
                collect += 1
                dfs(child, path + ch)

        dfs(node, prefix)
        return out, walk, collect

    def wildcard(self, word):
        calls = 0

        def dfs(node, i):
            nonlocal calls
            calls += 1
            if i == len(word):
                return node.is_end
            ch = word[i]
            if ch == ".":
                for child in node.children.values():
                    if dfs(child, i + 1):
                        return True
                return False
            if ch not in node.children:
                return False
            return dfs(node.children[ch], i + 1)

        return dfs(self.root, 0), calls


def scan_prefix(words, prefix):
    out, comps = [], 0
    for w in words:
        ok = True
        for k in range(len(prefix)):
            if k >= len(w):
                ok = False
                break
            comps += 1
            if w[k] != prefix[k]:
                ok = False
                break
        if ok:
            out.append(w)
    return out, comps


def make(words):
    t = Trie()
    for w in words:
        t.insert(w)
    return t


def gen_words(n, seed=42):
    """Park-Miller generator: the page's JavaScript makes the same list."""
    out, s = [], seed
    for _ in range(n):
        s = s * 48271 % 2147483647
        length = 3 + s % 4
        w = ""
        for _ in range(length):
            s = s * 48271 % 2147483647
            w += "abcdefgh"[s % 8]
        out.append(w)
    return out


def main():
    words = ["cat", "car", "card", "care", "cart", "dog", "dot", "door", "deer", "can"]
    t = make(words)
    print("== 1. Picture: autocomplete 'car' ==")
    print("words:", words)
    m, c = scan_prefix(words, "car")
    print("scan every word -> matches", m, "comparisons", c)
    m2, walk, col = t.autocomplete("car")
    print("trie            -> matches", m2, "walk", walk, "collect", col, "total", walk + col)
    print("build once: letters inserted", t.build_steps, " nodes created", t.nodes)
    k = next(q for q in range(1, 100) if t.build_steps + q * (walk + col) < q * c)
    print(f"trie (build + queries) beats scanning from query {k}: {t.build_steps} + {k} x {walk + col} = {t.build_steps + k * (walk + col)} vs {k} x {c} = {k * c}")
    print("\nplayground prefixes:")
    for p in ["c", "ca", "car", "card", "d", "do", "x", "cars"]:
        m, c = scan_prefix(words, p)
        m2, walk, col = t.autocomplete(p)
        assert m == m2, (p, m, m2)
        print(f"  {p!r:<7} matches {m}  scan {c}  trie {walk} + {col} = {walk + col}")

    print("\n== 1b. Race: generated words, prefix 'bad' ==")
    print("first 8 words of gen_words(100):", gen_words(100)[:8])
    for n in (100, 1000, 10000):
        ws = gen_words(n)
        tt = make(ws)
        m, c = scan_prefix(ws, "bad")
        m2, walk, col = tt.autocomplete("bad")
        assert sorted(set(m)) == sorted(m2)
        print(f"n = {n:>5}: scan {c:>5}  trie {walk} + {col:<2} = {walk + col:>2}  build {tt.build_steps:>5}  {c / (walk + col):.1f}x  ({len(m2)} matches)")

    print("\n== 4A. Insert trace ==")
    small = ["cat", "car", "card", "care", "dog"]
    ts = make(small)
    print(small, "letters inserted", ts.build_steps, "nodes created", ts.nodes)

    print("\n== 4B. search / starts_with on", small, "==")
    for q in ["car", "ca", "cards", "do"]:
        print(f"  search({q!r}) = {ts.search(q)}   starts_with({q!r}) = {ts.starts_with(q)}   walk steps = {ts._walk(q)[1]}")

    print("\n== 4C. Wildcard ==")
    wild = ["cat", "cot", "cut", "cup", "dog"]
    tw = make(wild)
    for q in ["c.t", ".o.", "c.p", "..g", "d.t", "..."]:
        print(f"  wildcard({q!r}) = {tw.wildcard(q)}   # (found, dfs calls)")

    print("\n== 6. Traps ==")
    tc = make(["card"])
    node, _ = tc._walk("car")
    print("only 'card' inserted. search('car') without the end check:", node is not None, " with it:", tc.search("car"))

    class SharedNode:
        def __init__(self, children={}):   # the trap: one dict shared by every node
            self.children = children
            self.is_end = False

    root = SharedNode()
    node = root
    for ch in "ab":
        if ch not in node.children:
            node.children[ch] = SharedNode()
        node = node.children[ch]
    node.is_end = True
    n2 = root
    found = True
    for ch in "b":
        if ch not in n2.children:
            found = False
            break
        n2 = n2.children[ch]
    print("mutable default: insert 'ab', then search('b') ->", found and n2.is_end, " root.children keys:", sorted(root.children))

    tm = make(["car"])
    before = tm.nodes

    def search_setdefault(trie, word):
        node = trie.root
        for ch in word:
            if ch not in node.children:
                trie.nodes += 1
            node = node.children.setdefault(ch, TrieNode())
        return node.is_end

    r = search_setdefault(tm, "cab")
    print(f"setdefault in search: search('cab') = {r}, nodes {before} -> {tm.nodes}, starts_with('cab') now = {tm.starts_with('cab')}")

    td = make(["cat", "dog"])

    def wildcard_buggy(trie, word):
        def dfs(node, i):
            if i == len(word):
                return node.is_end
            if word[i] == ".":
                for child in node.children.values():
                    return dfs(child, i + 1)      # the trap: gives up after the first child
                return False
            if word[i] not in node.children:
                return False
            return dfs(node.children[word[i]], i + 1)
        return dfs(trie.root, 0)

    print("wildcard '.og' on [cat, dog]: buggy", wildcard_buggy(td, ".og"), " fixed", td.wildcard(".og")[0])

    print("\n== 7. Complexity ==")
    print("10 lesson words: letters", t.build_steps, " trie nodes", t.nodes)
    prefixes = {w[:k] for w in words for k in range(1, len(w) + 1)}
    print("set of every prefix instead: strings", len(prefixes), " letters stored", sum(len(p) for p in prefixes))
    big = gen_words(10000)
    tb = make(big)
    pb = {w[:k] for w in big for k in range(1, len(w) + 1)}
    print("10000 generated words: letters", tb.build_steps, " trie nodes", tb.nodes, " prefix set strings", len(pb), " letters stored", sum(len(p) for p in pb))
    print("wildcard '...' on 10000 generated words:", tb.wildcard("..."), " '......':", tb.wildcard("......"))

    print("\n== 9. Check yourself ==")
    q1 = make(["app", "apple", "apply", "apt"])
    print("[app, apple, apply, apt] nodes:", q1.nodes, " letters:", q1.build_steps)
    q2 = make(["apple"])
    print("only 'apple': search('app') =", q2.search("app"), " starts_with('app') =", q2.starts_with("app"))
    q3 = make(["app", "apt", "ape", "bat"])
    print("[app, apt, ape, bat] wildcard 'b..':", q3.wildcard("b.."), " 'a.e':", q3.wildcard("a.e"))

    print("\n== Sandbox examples ==")
    ex = [
        (["cat", "car", "card", "care", "dog"], "car"),
        (["apple", "app", "apply", "apt"], "app"),
        (["cat", "cot", "cut", "cup", "dog"], "c.t"),
        (["sea", "seat", "seal", "see", "set"], "sea"),
        (["cat", "car", "card", "care", "dog"], "ca"),
        (["cat", "dog"], "cow"),
    ]
    for ws, q in ex:
        tt = make(ws)
        print(f"{ws} query {q!r}: nodes {tt.nodes} letters {tt.build_steps}", end="  ")
        if "." in q:
            print("wildcard", tt.wildcard(q))
        else:
            m, c = scan_prefix(ws, q)
            m2, walk, col = tt.autocomplete(q)
            print(f"search {tt.search(q)} starts_with {tt.starts_with(q)} matches {m2} scan {c} trie walk {walk} collect {col}")


if __name__ == "__main__":
    main()
