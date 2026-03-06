#!/bin/bash
# Mock task C - simulates rustup update with lots of output
echo "info: syncing channel updates for 'stable-aarch64-apple-darwin'"
sleep 0.3
echo "info: latest update on 2024-06-13, rust version 1.79.0 (129f3b996 2024-06-10)"
echo "info: downloading component 'cargo'"
echo "  4.7 MiB /   4.7 MiB (100%)   2.3 MiB/s in  2s ETA:  0s"
sleep 0.3
echo "info: downloading component 'clippy'"
echo "  2.3 MiB /   2.3 MiB (100%)   1.8 MiB/s in  1s ETA:  0s"
sleep 0.3
echo "info: downloading component 'rust-docs'"
echo " 15.2 MiB /  15.2 MiB (100%)   3.1 MiB/s in  5s ETA:  0s"
sleep 0.3
echo "info: downloading component 'rust-std'"
echo " 26.8 MiB /  26.8 MiB (100%)   4.2 MiB/s in  6s ETA:  0s"
sleep 0.3
echo "info: downloading component 'rustc'"
echo " 63.4 MiB /  63.4 MiB (100%)   5.1 MiB/s in 12s ETA:  0s"
sleep 0.3
echo "info: downloading component 'rustfmt'"
echo "  1.7 MiB /   1.7 MiB (100%)   2.1 MiB/s in  1s ETA:  0s"
sleep 0.2
echo "info: downloading component 'rust-analyzer'"
echo "  5.4 MiB /   5.4 MiB (100%)   2.8 MiB/s in  2s ETA:  0s"
sleep 0.2
echo "info: removing previous version of component 'cargo'"
echo "info: removing previous version of component 'clippy'"
echo "info: removing previous version of component 'rust-docs'"
echo "info: removing previous version of component 'rust-std'"
echo "info: removing previous version of component 'rustc'"
echo "info: removing previous version of component 'rustfmt'"
echo "info: removing previous version of component 'rust-analyzer'"
sleep 0.3
echo "info: installing component 'cargo'"
echo "info: installing component 'clippy'"
echo "info: installing component 'rust-docs'"
echo "info: installing component 'rust-std'"
echo "info: installing component 'rustc'"
echo "info: installing component 'rustfmt'"
echo "info: installing component 'rust-analyzer'"
sleep 0.3
echo ""
echo "  stable-aarch64-apple-darwin updated - rustc 1.79.0 (129f3b996 2024-06-10) (from rustc 1.75.0)"
echo ""
echo "info: checking for self-update"
echo "info: component 'rust-src' is up to date"
