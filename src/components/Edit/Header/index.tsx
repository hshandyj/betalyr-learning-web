import ToggleBtnDekstop from "./ToggleBtnDekstop";
import { Document } from "@/types/document";
import Saving from "./Saving";
import Updated from "./Updated";
import IconTitle from "./IconTitle";
import Share from "./Share";

interface HeaderProps {
  doc?: Document;
  isShare?: boolean;
}

const Header: React.FC<HeaderProps> = ({ doc, isShare }) => {
  return (
    <header className="p-3 h-[48px] flex items-center border-b border-border">
      {isShare ? null : (
        <>
          <ToggleBtnDekstop />
        </>
      )}

      {doc && (
        <div className="flex-1 flex items-center justify-between text-sm">
          <div className="flex gap-3 items-center truncate">
            <IconTitle doc={doc} />
            {doc.isPublic && (
              <div className="w-2 h-2 rounded-full bg-green-500" title="已发布" />
            )}
            <Saving />
          </div>
          <div className="flex gap-2">
            <Updated updatedAt={doc.updatedAt} />
            <Share isShare={isShare} isPublic={doc.isPublic} />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
