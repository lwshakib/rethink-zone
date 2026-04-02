import { Project, SyntaxKind } from "ts-morph";

/**
 * RepoIndex Type
 * Represents the structure of a repository's analyzed data.
 */
export type RepoIndex = {
  files: { path: string }[];
  functions: { name: string; file: string }[];
  classes: { name: string; file: string }[];
  imports: { file: string; module: string }[];
  calls: { from: string; to: string }[];
};

/**
 * GitHubTreeItem Interface
 * Represents an item in a GitHub repository tree.
 */
interface GitHubTreeItem {
  path: string;
  type: "blob" | "tree";
  sha: string;
  url: string;
  size?: number;
  mode: string;
}

/**
 * RepositoryService Class
 * Centralizes all repository-related operations, including analysis and fetching.
 */
export class RepositoryService {
  /**
   * Analyzes a GitHub repository and returns an index of its code structure.
   * @param repoUrl - The public GitHub URL of the repository.
   */
  async analyzeRepo(repoUrl: string): Promise<RepoIndex> {
    const { owner, repo, branch } = this.parseRepo(repoUrl);
    const tree = await this.getRepoTree(owner, repo, branch);

    const filesToAnalyze = tree.filter(
      (f: GitHubTreeItem) => f.type === "blob" && this.isCodeFile(f.path)
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
      const code = await this.fetchFile(owner, repo, branch, fileMetadata.path);
      if (!code) continue;

      try {
        const sourceFile = project.createSourceFile(fileMetadata.path, code);

        index.files.push({
          path: fileMetadata.path,
        });

        // Analyze imports
        sourceFile.getImportDeclarations().forEach((i) => {
          index.imports.push({
            file: fileMetadata.path,
            module: i.getModuleSpecifierValue(),
          });
        });

        // Analyze functions
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

        // Analyze classes
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

  /**
   * Parses a GitHub URL to extract owner, repo, and branch.
   */
  private parseRepo(url: string) {
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) throw new Error("Invalid GitHub URL");

    return {
      owner: match[1],
      repo: match[2].replace(".git", ""),
      branch: "main",
    };
  }

  /**
   * Fetches the repository tree from GitHub API.
   */
  private async getRepoTree(owner: string, repo: string, branch: string) {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch repository tree");
    }

    const data = (await res.json()) as { tree: GitHubTreeItem[] };
    return data.tree;
  }

  /**
   * Checks if a file path points to a поддерживаемый code file.
   */
  private isCodeFile(path: string) {
    return (
      (path.endsWith(".ts") ||
        path.endsWith(".tsx") ||
        path.endsWith(".js") ||
        path.endsWith(".jsx")) &&
      !path.includes("/node_modules/") &&
      !path.startsWith("node_modules/")
    );
  }

  /**
   * Fetches the raw content of a file from GitHub.
   */
  private async fetchFile(
    owner: string,
    repo: string,
    branch: string,
    path: string
  ) {
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;

    const res = await fetch(url);
    if (!res.ok) return null;

    return res.text();
  }
}

export const repositoryService = new RepositoryService();
