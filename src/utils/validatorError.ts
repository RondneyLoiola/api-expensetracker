import type { ZodIssue } from "zod";

export function validatorError(issues: ZodIssue[]): string[] {
	const errors = issues.map((item) => {
		return `${item.path.join(".")}: ${item.message}`;
	});

	return errors;
}
