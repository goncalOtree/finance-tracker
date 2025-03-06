"use client";

import { useState } from "react";
import {
  SignInButton,
  SignedIn,
  SignedOut,
  SignOutButton,
  useUser,
  useClerk,
} from "@clerk/nextjs";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "../shadcn/sheet";
import { LogOutIcon, UserIcon, DownloadIcon } from "lucide-react";
import Image from "next/image";
import ModeToggle from "../shadcn/ModeToggle";
import { fetchTransactionsbyYear } from "@/actions/transactions.action";
import { Button } from "../shadcn/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../shadcn/dialog";
import { Input } from "../shadcn/input";
import { Loader2 } from "lucide-react";

export default function ProfileSheet() {
  const [open, setOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const { openUserProfile } = useClerk();

  const handleAccountClick = () => {
    openUserProfile();
    setOpen(false);
  };

  const handleExportClick = async () => {
    if (!year) return;

    setLoading(true);
    try {
      const transactions = await fetchTransactionsbyYear(year);
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions, year }),
      });

      if (!response.ok) throw new Error("Erro ao gerar o arquivo");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions_${year}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      alert("Exportação concluída com sucesso!");
    } catch (error) {
      alert("Erro ao exportar dados");
    } finally {
      setLoading(false);
      setExportOpen(false);
    }
  };

  return (
    <>
      <SignedOut>
        <SignInButton>
          <button className="flex flex-col items-center text-gray-400 dark:text-gray-500">
            <UserIcon size={24} />
            <span className="text-xs mt-1">Iniciar Sessão</span>
          </button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center text-gray-400 dark:text-gray-500">
              {user?.imageUrl ? (
                <div className="w-6 h-6 rounded-full overflow-hidden">
                  <Image
                    src={user.imageUrl}
                    alt="Profile"
                    width={24}
                    height={24}
                    className="object-cover"
                  />
                </div>
              ) : (
                <UserIcon size={24} />
              )}
              <span className="text-xs mt-1">Perfil</span>
            </button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="rounded-t-3xl pt-6 h-auto max-h-[80vh]"
          >
            <SheetTitle>Perfil</SheetTitle>
            <div className="flex flex-col items-center space-y-6">
              <div className="flex items-center justify-center w-full relative">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full border-4 border-purple-500 overflow-hidden">
                      {user?.imageUrl ? (
                        <Image
                          src={user.imageUrl}
                          alt="Profile"
                          width={80}
                          height={80}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                          <UserIcon
                            size={40}
                            className="text-gray-500 dark:text-gray-400"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Olá,</p>
                    <h3 className="text-xl font-semibold">
                      {user?.fullName || user?.username || "User"}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="w-full space-y-3 px-4">
                <button
                  onClick={handleAccountClick}
                  className="w-full flex items-center space-x-3 p-4 rounded-xl bg-purple-50 dark:bg-gray-800"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                    <UserIcon size={20} className="text-purple-500" />
                  </div>
                  <span className="font-medium">Conta</span>
                </button>

                <Dialog open={exportOpen} onOpenChange={setExportOpen}>
                  <DialogTrigger asChild>
                    <button className="w-full flex items-center space-x-3 p-4 rounded-xl bg-purple-50 dark:bg-gray-800">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                        <DownloadIcon size={20} className="text-purple-500" />
                      </div>
                      <span className="font-medium">Exportar Dados</span>
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Exportar Dados</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        type="number"
                        placeholder="Digite o ano"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                      />
                      <Button onClick={handleExportClick} disabled={loading}>
                        {loading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Exportar
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <ModeToggle />

                <SignOutButton>
                  <button className="w-full flex items-center space-x-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20">
                    <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                      <LogOutIcon size={20} className="text-red-500" />
                    </div>
                    <span className="font-medium text-red-500">Sair</span>
                  </button>
                </SignOutButton>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </SignedIn>
    </>
  );
}
