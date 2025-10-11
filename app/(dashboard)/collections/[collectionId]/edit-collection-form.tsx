"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Collection } from "@/types/product";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const collectionSchema = z.object({
  nom: z.string().min(3, {
    message: "Précisez un titre",
  }),
  description: z.string().optional(),
});

export const EditCollectionForm = ({
  collection,
}: {
  collection: Collection;
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      nom: "",
      description: "",
    },
  });

  // Réinitialiser le formulaire avec les données de la collection
  useEffect(() => {
    if (collection) {
      form.reset({
        nom: collection.nom || "",
        description: collection.description || "",
      });
    }
  }, [collection, form]);

  async function onSubmit(values: z.infer<typeof collectionSchema>) {
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/collections/modifier/${collection.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      if (response.ok) {
        toast.success("Collection modifiée avec succès", {
          position: "top-center",
        });
        router.push("/dashboard/collections");
      } else {
        const errorData = await response.json().catch(() => ({
          message: "Erreur lors de la modification"
        }));
        toast.error(errorData?.message || "Erreur lors de la modification");
      }
    } catch (error) {
      console.error("General error:", error);
      toast.error("Erreur lors de la modification");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full">
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <FormField
                control={form.control}
                name="nom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              variant="ghost"
              size="lg"
              disabled={isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear mt-20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Modification..." : "Modifier"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
