import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

export default function SafeMonaco({ value }: { value: string }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <MonacoEditor
      height="20px"
      key={value}
      value={value}
      defaultLanguage="python"
      options={{
        readOnly: true,
        domReadOnly: true,
        tabIndex: -1,
        minimap: { enabled: false },
        lineNumbers: "off",
        fontSize: 12,
        scrollBeyondLastLine: false,
        contextmenu: false,
        renderLineHighlight: "none",
        overviewRulerLanes: 0,
        scrollbar: {
          vertical: "hidden",
          horizontal: "hidden",
          handleMouseWheel: false,
        },
        cursorStyle: "line",
        hideCursorInOverviewRuler: true,
        renderWhitespace: "none",
        accessibilitySupport: "off",
      }}
    />
  );
}
