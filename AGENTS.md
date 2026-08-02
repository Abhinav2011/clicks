<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:git-rules -->
# Git Push Policy

NEVER run `git push`, `git merge`, `git rebase` (onto remote), or any command that modifies the remote repository without the user's **explicit instruction**. Local commits (`git add`, `git commit`) are allowed, but always stop before pushing and inform the user what is ready to push.
<!-- END:git-rules -->
