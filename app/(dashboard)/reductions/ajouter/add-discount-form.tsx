"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const discountSchema = z.object({
  code: z.string().min(3, "Le code doit contenir au moins 3 caractères"),
  description: z.string().optional(),
  type: z.enum(["PERCENTAGE", "AMOUNT"] as const),
  value: z.string().min(1, "La valeur est requise"),
  minAmount: z.string().optional(),
  maxUses: z.string().optional(),
  isActive: z.boolean().default(true),
  startsAt: z.date().optional(),
  expiresAt: z.date().optional(),
});

type DiscountFormData = z.infer<typeof discountSchema>;

export const AddDiscountForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      code: "",
      description: "",
      type: "PERCENTAGE" as const,
      value: "",
      minAmount: "",
      maxUses: "",
      isActive: true,
    },
  });

  async function onSubmit(values: DiscountFormData) {
    setIsLoading(true);

    try {
      const discountData = {
        code: values.code.toUpperCase(),
        description: values.description || undefined,
        type: values.type,
        value: values.value,
        minAmount: values.minAmount,
        maxUses: values.maxUses,
        isActive: values.isActive,
        startsAt: values.startsAt,
        expiresAt: values.expiresAt,
      };

      const response = await fetch("/api/discounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(discountData),
      });

      if (response.ok) {
        toast.success("Réduction créée avec succès", {
          position: "top-center",
        });
        form.reset();
        router.push("/reductions");
      } else {
        const errorData = await response.json().catch(() => ({
          error: "Erreur lors de la création",
        }));
        toast.error(errorData.error || "Erreur lors de la création", {
          position: "top-center",
        });
      }
    } catch (error) {
      console.error("General error:", error);
      toast.error("Erreur lors de la création", {
        position: "top-center",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Nouvelle réduction</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Code */}
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code de réduction</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="ex: NOEL2024"
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de réduction</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">Pourcentage</SelectItem>
                        <SelectItem value="AMOUNT">Montant fixe</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Description de la réduction..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Valeur */}
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {form.watch("type") === "PERCENTAGE"
                        ? "Pourcentage (%)"
                        : "Montant (€)"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step={
                          form.watch("type") === "PERCENTAGE" ? "1" : "0.01"
                        }
                        min="0"
                        max={
                          form.watch("type") === "PERCENTAGE"
                            ? "100"
                            : undefined
                        }
                        placeholder={
                          form.watch("type") === "PERCENTAGE"
                            ? "ex: 20"
                            : "ex: 10.00"
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Montant minimum */}
              <FormField
                control={form.control}
                name="minAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant minimum (€) (optionnel)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="ex: 50.00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Nombre d'utilisations max */}
            <FormField
              control={form.control}
              name="maxUses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nombre d&#39;utilisations maximum (optionnel)
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="1"
                      placeholder="ex: 100"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date de début */}
              <FormField
                control={form.control}
                name="startsAt"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date de début (optionnel)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value &&
                            field.value instanceof Date &&
                            !isNaN(field.value.getTime()) ? (
                              format(field.value, "PPP 'à' HH:mm", {
                                locale: fr,
                              })
                            ) : (
                              <span>Sélectionner une date et heure</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            if (date) {
                              // Si une date existe déjà, conserver l'heure
                              if (field.value) {
                                const newDate = new Date(date);
                                newDate.setHours(field.value.getHours());
                                newDate.setMinutes(field.value.getMinutes());
                                field.onChange(newDate);
                              } else {
                                // Nouvelle date, définir à maintenant
                                const now = new Date();
                                date.setHours(now.getHours());
                                date.setMinutes(now.getMinutes());
                                field.onChange(date);
                              }
                            } else {
                              field.onChange(date);
                            }
                          }}
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return date < today;
                          }}
                          initialFocus
                        />
                        {field.value && (
                          <div className="p-3 border-t">
                            <div className="flex items-center gap-2">
                              <label className="text-sm font-medium">
                                Heure :
                              </label>
                              <Input
                                type="time"
                                value={
                                  field.value &&
                                  field.value instanceof Date &&
                                  !isNaN(field.value.getTime())
                                    ? format(field.value, "HH:mm")
                                    : ""
                                }
                                onChange={(e) => {
                                  if (field.value) {
                                    const [hours, minutes] =
                                      e.target.value.split(":");
                                    const newDate = new Date(field.value);
                                    newDate.setHours(parseInt(hours));
                                    newDate.setMinutes(parseInt(minutes));
                                    field.onChange(newDate);
                                  }
                                }}
                                className="w-32"
                              />
                            </div>
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date d'expiration */}
              <FormField
                control={form.control}
                name="expiresAt"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date &#39;expiration (optionnel)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value &&
                            field.value instanceof Date &&
                            !isNaN(field.value.getTime()) ? (
                              format(field.value, "PPP 'à' HH:mm", {
                                locale: fr,
                              })
                            ) : (
                              <span>Sélectionner une date et heure</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            if (date) {
                              // Si une date existe déjà, conserver l'heure
                              if (field.value) {
                                const newDate = new Date(date);
                                newDate.setHours(field.value.getHours());
                                newDate.setMinutes(field.value.getMinutes());
                                field.onChange(newDate);
                              } else {
                                // Nouvelle date, définir à 23:59 pour l'expiration
                                date.setHours(23);
                                date.setMinutes(59);
                                field.onChange(date);
                              }
                            } else {
                              field.onChange(date);
                            }
                          }}
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return date < today;
                          }}
                          initialFocus
                        />
                        {field.value && (
                          <div className="p-3 border-t">
                            <div className="flex items-center gap-2">
                              <label className="text-sm font-medium">
                                Heure :
                              </label>
                              <Input
                                type="time"
                                value={
                                  field.value &&
                                  field.value instanceof Date &&
                                  !isNaN(field.value.getTime())
                                    ? format(field.value, "HH:mm")
                                    : ""
                                }
                                onChange={(e) => {
                                  if (field.value) {
                                    const [hours, minutes] =
                                      e.target.value.split(":");
                                    const newDate = new Date(field.value);
                                    newDate.setHours(parseInt(hours));
                                    newDate.setMinutes(parseInt(minutes));
                                    field.onChange(newDate);
                                  }
                                }}
                                className="w-32"
                              />
                            </div>
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Statut actif */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Statut</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      {field.value ? "Réduction active" : "Réduction inactive"}
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className={`scale-125 ${
                        field.value ? "data-[state=checked]:bg-green-500" : ""
                      }`}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full cursor-pointer"
            >
              {isLoading ? "Création en cours..." : "Créer la réduction"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
