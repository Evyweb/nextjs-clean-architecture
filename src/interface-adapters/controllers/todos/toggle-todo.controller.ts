import { getInjection } from "@/di/container";
import { toggleTodoUseCase } from "@/src/application/use-cases/todos/toggle-todo.use-case";
import { UnauthenticatedError } from "@/src/entities/errors/auth";
import { InputParseError } from "@/src/entities/errors/common";
import { Todo } from "@/src/entities/models/todo";
import { z } from "zod";

function presenter(todo: Todo) {
  return {
    id: todo.id,
    todo: todo.todo,
    userId: todo.userId,
    completed: todo.completed,
  };
}

const inputSchema = z.object({ todoId: z.number() });

export async function toggleTodoController(
  input: Partial<z.infer<typeof inputSchema>>,
  sessionId: string | undefined,
): Promise<ReturnType<typeof presenter>> {
  if (!sessionId) {
    throw new UnauthenticatedError("Must be logged in to create a todo");
  }

  const authenticationService = getInjection("IAuthenticationService");
  const { session } = await authenticationService.validateSession(sessionId);

  const { data, error: inputParseError } = inputSchema.safeParse(input);

  if (inputParseError) {
    throw new InputParseError("Invalid data", { cause: inputParseError });
  }

  const todo = await toggleTodoUseCase({ todoId: data.todoId }, session.userId);

  return presenter(todo);
}