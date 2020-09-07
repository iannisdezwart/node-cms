import { resolve as resolvePath } from 'path'

// Dot-dot-slash attack prevention

export const dotDotSlashAttack = (path: string, root: string) => {
	const resolvedPath = resolvePath(path)
	const rootPath = resolvePath(root)

	if (!resolvedPath.startsWith(rootPath)) {
		return true
	}

	return false
}

export const filePathIsSafe = (path: string, root: string) => {
	if (dotDotSlashAttack(path, root)) {
		return false
	}

	const resolvedPath = resolvePath(path)

	// Prevent user from creating .node.js or .node.ts files

	if (resolvedPath.endsWith('.node.js') || resolvedPath.endsWith('.node.ts')) {
		return false
	}

	return true
}