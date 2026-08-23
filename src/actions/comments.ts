"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStudent, requireTeacher } from "@/lib/auth/session";
import type { ActionResult } from "@/types";

/**
 * Santri menandai komentar review sebagai RESOLVED.
 */
export async function resolveComment(formData: FormData): Promise<ActionResult> {
  const user = await requireStudent();
  const commentId = String(formData.get("comment_id"));

  try {
    const comment = await prisma.reviewComment.findUnique({
      where: { id: commentId },
      include: { article: true },
    });
    if (!comment) return { success: false, error: "Komentar tidak ditemukan." };
    if (comment.article.author_id !== user.id) {
      return { success: false, error: "Anda tidak memiliki izin untuk tindakan ini." };
    }

    await prisma.reviewComment.update({
      where: { id: commentId },
      data: { status: "RESOLVED", resolved_at: new Date() },
    });

    await prisma.auditLog.create({
      data: {
        user_id: user.id,
        action: "STUDENT_RESOLVED_COMMENT",
        entity_type: "review_comment",
        entity_id: commentId,
      },
    });

    revalidatePath(`/dashboard/student/articles/${comment.article_id}/edit`);
    revalidatePath("/dashboard/student");
    return { success: true };
  } catch (error) {
    console.error("resolveComment error:", error);
    return { success: false, error: "Terjadi kesalahan saat menandai komentar." };
  }
}
