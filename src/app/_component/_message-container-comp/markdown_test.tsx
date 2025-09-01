"use client";

import FormattedMessage from "./formatted_message";

const MarkdownTest = () => {
  // Sample markdown content showcasing all supported features
  const sampleMarkdown = `
# Markdown Rendering Test

This is a demonstration of all the markdown features supported by our chat application.

## Text Formatting

You can use **bold text**, *italic text*, and ~~strikethrough text~~. 
You can also combine **bold and _italic_** formatting.

## Lists

### Unordered Lists:

* Item 1
* Item 2
  * Nested item 2.1
  * Nested item 2.2
* Item 3

### Ordered Lists:

1. First item
2. Second item
   1. Nested item 2.1
   2. Nested item 2.2
3. Third item

## Code Examples

Inline code: \`const x = 42;\`

\`\`\`javascript
// JavaScript example
function helloWorld() {
  const message = "Hello, World!";
  console.log(message);
  return message;
}

// This will output "Hello, World!" to the console
helloWorld();
\`\`\`

\`\`\`python
# Python example
def hello_world():
    message = "Hello, World!"
    print(message)
    return message

# This will output "Hello, World!" to the console
hello_world()
\`\`\`

\`\`\`css
/* CSS example */
.markdown-content {
  color: #f8f9fa;
  font-size: 1rem;
  line-height: 1.6;
}

.code-block {
  margin: 1rem 0;
  background-color: #1e1e1e;
  border-radius: 6px;
}
\`\`\`

## Blockquotes

> This is a blockquote.
> 
> It can span multiple lines.
>
> > And it can be nested.

## Tables

| Feature | Support | Notes |
|---------|---------|-------|
| Headings | ✅ | H1, H2, H3, etc. |
| Lists | ✅ | Ordered & unordered |
| Code Blocks | ✅ | With syntax highlighting |
| Tables | ✅ | With headers and alignment |

## Horizontal Rule

---

## Links

[Visit GitHub](https://github.com)

## Images

Here's how images would appear:

![Sample Image](https://via.placeholder.com/150)

`;

  return (
    <div className="p-6 bg-gray-900 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-white">
        Markdown Rendering Test
      </h2>
      <div className="bg-gray-800 p-4 rounded-lg">
        <FormattedMessage content={sampleMarkdown} />
      </div>
    </div>
  );
};

export default MarkdownTest;
