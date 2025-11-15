import { z } from "zod"

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, 'Project name is required'),
  image: z.union([
    z.instanceof(File),
    z.string().transform((value) => value === "" ? undefined : value)
  ])
  .optional(),
  workspaceId: z.string(),
});

export const createProjectFormSchema = z.object({
  name: z.string().trim().min(1, "Project name is required"),
  image: z
    .union([
      z.instanceof(File),
      z.string().transform((value) => (value === "" ? undefined : value)),
    ])
    .optional(),
});

// ⭐ Backend server schema (workspaceId REQUIRED)
export const createProjectServerSchema = z.object({
  name: z.string().trim().min(1),
  workspaceId: z.string().min(1),
  image: z.any().optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().trim().min(1, 'Minimum 1 character required').optional(),
  image: z.union([
    z.instanceof(File),
    z.string().transform((value) => value === "" ? undefined : value)
  ])
  .optional(),
});

