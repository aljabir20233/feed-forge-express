import { createFileRoute } from "@tanstack/react-router";
import { ArticleEditor } from "@/components/admin/ArticleEditor";

export const Route = createFileRoute("/admin/new")({
  component: () => <ArticleEditor />,
});
