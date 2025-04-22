import { UserProfile } from "@clerk/nextjs/app-beta/client";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface SettingProps {
  children: React.ReactNode;
}

const Setting: React.FC<SettingProps> = ({ children }) => {
  return (
    <Dialog>
      <DialogTrigger asChild className="w-full">
        {children}
      </DialogTrigger>
      <DialogContent className="">
        <UserProfile
          appearance={{
            elements: {
              rootBox: "h-max mx-auto",
              card: "h-[calc(100vh_-_6rem)] max-h-[44rem] w-[inherit] mx-auto",
            },
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default Setting;
