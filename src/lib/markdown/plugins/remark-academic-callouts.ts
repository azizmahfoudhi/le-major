import { visit } from 'unist-util-visit';
import type { Root, Node } from 'mdast';

interface DirectiveNode extends Omit<Node, 'data'> {
  name?: string;
  attributes?: Record<string, string>;
  children?: unknown[];
  data?: {
    directiveLabel?: boolean;
    [key: string]: unknown;
  };
}

/**
 * Remark plugin that transforms container directives (:::definition, :::remember, etc.)
 * into MDX JSX elements mapped to AcademicCallout components.
 *
 * Usage in Markdown:
 * :::definition[Coût total]
 * Le coût total est la somme du coût fixe et du coût variable.
 * :::
 */
export function remarkAcademicCallouts() {
  return (tree: Root) => {
    visit(tree, (node: Node) => {
      const dNode = node as DirectiveNode;
      if (
        node.type === 'containerDirective' ||
        node.type === 'leafDirective'
      ) {
        const name = dNode.name?.toLowerCase();
        const validTypes = [
          'definition',
          'remember',
          'example',
          'warning',
          'formula',
        ];

        if (!name || !validTypes.includes(name)) return;

        // Extract optional title from [Title] directive label
        const labelChild = dNode.children?.find(
          (child: unknown) => (child as DirectiveNode).data?.directiveLabel
        ) as DirectiveNode | undefined;
        const title = labelChild
          ? (labelChild.children?.[0] as { value?: string })?.value
          : dNode.attributes?.title;

        // Filter out the label node from content children
        const contentChildren =
          dNode.children?.filter(
            (child: unknown) => !(child as DirectiveNode).data?.directiveLabel
          ) || [];

        // Transform into MDX JSX element
        const targetNode = node as unknown as Record<string, unknown>;
        targetNode.type = 'mdxJsxFlowElement';
        targetNode.name = 'AcademicCallout';
        targetNode.attributes = [
          {
            type: 'mdxJsxAttribute',
            name: 'type',
            value: name,
          },
          ...(title
            ? [
                {
                  type: 'mdxJsxAttribute',
                  name: 'title',
                  value: title,
                },
              ]
            : []),
        ];
        targetNode.children = contentChildren;
      }
    });
  };
}
