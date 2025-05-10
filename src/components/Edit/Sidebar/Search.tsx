import { ChangeEvent, useEffect, useState } from "react";
import { Icons } from "@/components/Icons";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import Links from "@/components/Edit/Sidebar/Links";
import { DocumentType } from "../../../types/document";
import { VisuallyHidden } from "@/components/Edit/Sidebar/visually-hidden";

interface SearchProps {
  docs: DocumentType[] | undefined;
  children: React.ReactNode;
}

const Search: React.FC<SearchProps> = ({ docs = [], children }) => {
  const [search, setSearch] = useState<string>("");
  const [arraySearch, setArraySearch] = useState<DocumentType[]>(docs);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearch(value);

    const filteredItems = docs?.filter((item: DocumentType) => {
      return item.title.toLowerCase().includes(value.toLowerCase());
    });
    setArraySearch(filteredItems || []);
  };

  useEffect(() => {
    if (docs) {
      setArraySearch(docs);
    }
  }, [docs]);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[calc(100%_-_100px)] max-w-[750px] mx-auto">
        <VisuallyHidden>
          <DialogTitle>搜索文档</DialogTitle>
        </VisuallyHidden>
        <div className="bg-background h-[calc(100vh_-_6rem)] md:h-screen max-h-[44rem] rounded-2xl overflow-hidden">
          <div className="relative h-12">
            <Icons.Search className="h-6 w-6 p-1 absolute z-10 top-[50%] translate-y-[-50%] left-4" />
            <Input
              placeholder="Search"
              value={search}
              onChange={onChange}
              className="w-full py-4 pr-4 pl-[52px] rounded-2xl absolute z-0 focus-visible:ring-0 h-12 text-base"
            />
          </div>
          <ScrollArea
            className="h-[calc(100%_-_48px)] w-full overflow-visible"
            type="auto"
          >
            <ul>
              <Links docs={arraySearch} size="medium" />
            </ul>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Search;
