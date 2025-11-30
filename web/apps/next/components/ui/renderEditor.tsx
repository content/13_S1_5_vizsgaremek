import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";

export default function renderEditor(data: any) {
  return data.blocks.map((block: any, i: number) => {
    switch (block.type) {
      case "header":
        return <h2 key={i}>{block.data.text}</h2>;
      case "list":
        return block.data.style === "ordered" ? (
          <ol key={i}>{block.data.items.map((item: string, j: number) => <li key={j}>{item}</li>)}</ol>
        ) : (
          <ul key={i}>{block.data.items.map((item: string, j: number) => <li key={j}>{item}</li>)}</ul>
        );
      default:
        return null;
    }
  });
};