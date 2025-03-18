def solve(n, k):
    count = 0
    count = n // k if n % 2 and k % 2 else n // (k - 1)
    if n % k if n % 2 and k % 2 else n % (k - 1):
        count += 1
    return count


if __name__ == "__main__":
    for _ in range(int(input())):
        n, k = map(int, input().split())
        print(solve(n, k))
