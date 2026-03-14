import { Project, SyntaxKind } from "ts-morph";

export type RepoIndex = {
  files: { path: string }[];
  functions: { name: string; file: string }[];
  classes: { name: string; file: string }[];
  imports: { file: string; module: string }[];
  calls: { from: string; to: string }[];
};

function parseRepo(url: string) {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) throw new Error("Invalid GitHub URL");

  return {
    owner: match[1],
    repo: match[2].replace(".git", ""),
    branch: "main",
  };
}

async function getRepoTree(owner: string, repo: string, branch: string) {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    {
      headers: {
        Accept: "application/vnd.github.v3+json",
        // 'Authorization': `token ${process.env.GITHUB_TOKEN}` // Optional: add if needed
      },
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch repository tree");
  }

  const data = (await res.json()) as any;
  return data.tree;
}

function isCodeFile(path: string) {
  return (
    (path.endsWith(".ts") ||
      path.endsWith(".tsx") ||
      path.endsWith(".js") ||
      path.endsWith(".jsx")) &&
    !path.includes("/node_modules/") &&
    !path.startsWith("node_modules/")
  );
}

async function fetchFile(owner: string, repo: string, branch: string, path: string) {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;

  const res = await fetch(url);
  if (!res.ok) return null;

  return res.text();
}

export async function analyzeRepo(repoUrl: string): Promise<RepoIndex> {
  const { owner, repo, branch } = parseRepo(repoUrl);
  const tree = await getRepoTree(owner, repo, branch);

  const filesToAnalyze = tree.filter(
    (f: any) => f.type === "blob" && isCodeFile(f.path)
  );

  const index: RepoIndex = {
    files: [],
    functions: [],
    classes: [],
    imports: [],
    calls: [],
  };

  const project = new Project({ useInMemoryFileSystem: true });

  // Limit to first 30 files to avoid hitting limits and for performance
  for (const fileMetadata of filesToAnalyze.slice(0, 30)) {
    const code = await fetchFile(owner, repo, branch, fileMetadata.path);
    if (!code) continue;

    try {
      const sourceFile = project.createSourceFile(fileMetadata.path, code);

      index.files.push({
        path: fileMetadata.path,
      });

      // imports
      sourceFile.getImportDeclarations().forEach((i) => {
        index.imports.push({
          file: fileMetadata.path,
          module: i.getModuleSpecifierValue(),
        });
      });

      // functions
      sourceFile.getFunctions().forEach((fn) => {
        const name = fn.getName();
        if (!name) return;

        index.functions.push({
          name,
          file: fileMetadata.path,
        });

        fn.getDescendantsOfKind(SyntaxKind.CallExpression).forEach((call) => {
          index.calls.push({
            from: name,
            to: call.getExpression().getText(),
          });
        });
      });

      // classes
      sourceFile.getClasses().forEach((cls) => {
        const name = cls.getName();
        if (!name) return;

        index.classes.push({
          name,
          file: fileMetadata.path,
        });
      });
    } catch (e) {
      console.warn("Skipping file analysis for:", fileMetadata.path, e);
    }
  }

  return index;
}
