"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Discount, DiscountType } from "@/types/order";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconCalendar,
  IconEdit,
  IconPercentage,
  IconTicket,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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

interface DiscountEditSheetProps {
  isOpen: boolean;
  onClose: () => void;
  discount: Discount | null;
  onDiscountUpdate?: (discountId: string, updatedDiscount: Discount) => void;
}

export function DiscountEditSheet({
  isOpen,
  onClose,
  discount,
  onDiscountUpdate,
}: DiscountEditSheetProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(discountSchema),
  });

  // Charger les données de la réduction
  useEffect(() => {
    if (discount) {
      setValue("code", discount.code);
      setValue("description", discount.description || "");
      setValue("type", discount.type);
      setValue("value", discount.value.toString());
      setValue("minAmount", discount.minAmount?.toString() || "");
      setValue("maxUses", discount.maxUses?.toString() || "");
      setValue("isActive", discount.isActive);
      setValue(
        "startsAt",
        discount.startsAt ? new Date(discount.startsAt) : undefined
      );
      setValue(
        "expiresAt",
        discount.expiresAt ? new Date(discount.expiresAt) : undefined
      );
    }
  }, [discount, setValue]);

  const formatValue = (type: string, value: number) => {
    if (type === "PERCENTAGE") {
      return `${value}%`;
    }
    return `${value.toFixed(2)} €`;
  };

  const isExpired = (expiresAt?: Date | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const isNotStarted = (startsAt?: Date | null) => {
    if (!startsAt) return false;
    return new Date(startsAt) > new Date();
  };

  const getDiscountStatus = () => {
    if (!discount) return { label: "Inconnu", variant: "outline" as const };

    const expired = isExpired(discount.expiresAt);
    const notStarted = isNotStarted(discount.startsAt);

    if (expired) {
      return { label: "Expiré", variant: "destructive" as const };
    }
    if (notStarted) {
      return { label: "Pas encore actif", variant: "secondary" as const };
    }
    if (discount.isActive) {
      return { label: "Actif", variant: "default" as const };
    }
    return { label: "Inactif", variant: "outline" as const };
  };

  const onSubmit = async (data: DiscountFormData) => {
    if (!discount) return;

    setIsLoading(true);

    try {
      const discountData = {
        code: data.code.toUpperCase(),
        description: data.description || undefined,
        type: data.type,
        value: data.value,
        minAmount: data.minAmount,
        maxUses: data.maxUses,
        isActive: data.isActive,
        startsAt: data.startsAt,
        expiresAt: data.expiresAt,
      };

      const response = await fetch(`/api/discounts/${discount.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(discountData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: "Erreur lors de la mise à jour",
        }));
        throw new Error(
          errorData.error ||
            errorData.details ||
            "Erreur lors de la mise à jour de la réduction"
        );
      }

      const updatedDiscount = await response.json();

      toast.success("Réduction mise à jour avec succès", {
        position: "top-center",
      });

      if (onDiscountUpdate) {
        onDiscountUpdate(discount.id, updatedDiscount);
      }

      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour de la réduction",
        {
          position: "top-center",
        }
      );
      console.error("Error updating discount:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!discount) return null;

  const statusConfig = getDiscountStatus();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:w-[600px] sm:max-w-[600px] overflow-y-auto p-0">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col h-full"
        >
          <SheetHeader className="px-6 py-4 border-b bg-gray-50/50 dark:bg-card">
            <SheetTitle className="flex items-center gap-3 text-xl">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-card rounded-lg">
                <IconEdit className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="font-semibold">Réduction {discount.code}</div>
                <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  Créée le{" "}
                  {format(new Date(discount.createdAt), "PPP", { locale: fr })}
                </div>
              </div>
            </SheetTitle>
            <div className="mt-3 flex items-center gap-3">
              <Badge variant={statusConfig.variant} className="px-3 py-1">
                <IconTicket className="h-3 w-3 mr-2" />
                {statusConfig.label}
              </Badge>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Valeur:{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatValue(discount.type, discount.value)}
                </span>
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Utilisé {discount.usedCount} fois
                {discount.maxUses && ` sur ${discount.maxUses}`}
              </span>
            </div>
          </SheetHeader>

          <div className="flex-1 px-6 py-6 space-y-8">
            {/* Informations de base */}
            <div className="space-y-5">
              <div className="flex items-center gap-3 pb-2">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-card rounded-lg">
                  <IconPercentage className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Informations de base
                </h3>
              </div>

              <div className="bg-white dark:bg-card border dark:border-gray-700 rounded-lg p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="code"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Code de réduction
                    </Label>
                    <Input
                      id="code"
                      {...register("code")}
                      placeholder="ex: NOEL2024"
                      className="h-10"
                      onChange={(e) =>
                        setValue("code", e.target.value.toUpperCase())
                      }
                    />
                    {errors.code && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.code.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="type"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Type de réduction
                    </Label>
                    <Select
                      value={watch("type")}
                      onValueChange={(value) =>
                        setValue("type", value as DiscountType)
                      }
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Sélectionner le type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">Pourcentage</SelectItem>
                        <SelectItem value="AMOUNT">Montant fixe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Description (optionnel)
                  </Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Description de la réduction..."
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="value"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      {watch("type") === "PERCENTAGE"
                        ? "Pourcentage (%)"
                        : "Montant (€)"}
                    </Label>
                    <Input
                      id="value"
                      {...register("value")}
                      type="number"
                      step={watch("type") === "PERCENTAGE" ? "1" : "0.01"}
                      min="0"
                      max={watch("type") === "PERCENTAGE" ? "100" : undefined}
                      placeholder={
                        watch("type") === "PERCENTAGE" ? "ex: 20" : "ex: 10.00"
                      }
                      className="h-10"
                    />
                    {errors.value && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.value.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="minAmount"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Montant minimum (€) (optionnel)
                    </Label>
                    <Input
                      id="minAmount"
                      {...register("minAmount")}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="ex: 50.00"
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="maxUses"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Nombre d&#39;utilisations maximum (optionnel)
                  </Label>
                  <Input
                    id="maxUses"
                    {...register("maxUses")}
                    type="number"
                    min="1"
                    placeholder="ex: 100"
                    className="h-10"
                  />
                </div>
              </div>
            </div>

            {/* Dates et statut */}
            <div className="space-y-5">
              <div className="flex items-center gap-3 pb-2">
                <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-lg">
                  <IconCalendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Dates et statut
                </h3>
              </div>

              <div className="bg-white dark:bg-card border dark:border-gray-700 rounded-lg p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Date de début */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Date de début (optionnel)
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-10 pl-3 text-left font-normal",
                            !watch("startsAt") && "text-muted-foreground"
                          )}
                        >
                          {watch("startsAt") ? (
                            format(watch("startsAt")!, "PPP 'à' HH:mm", {
                              locale: fr,
                            })
                          ) : (
                            <span>Sélectionner une date et heure</span>
                          )}
                          <IconCalendar className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={watch("startsAt")}
                          onSelect={(date) => {
                            if (date) {
                              // Si une date existe déjà, conserver l'heure
                              if (watch("startsAt")) {
                                const newDate = new Date(date);
                                const currentValue = watch("startsAt")!;
                                newDate.setHours(currentValue.getHours());
                                newDate.setMinutes(currentValue.getMinutes());
                                setValue("startsAt", newDate);
                              } else {
                                // Nouvelle date, définir à maintenant
                                const now = new Date();
                                date.setHours(now.getHours());
                                date.setMinutes(now.getMinutes());
                                setValue("startsAt", date);
                              }
                            } else {
                              setValue("startsAt", date);
                            }
                          }}
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return date < today;
                          }}
                          initialFocus
                        />
                        {watch("startsAt") && (
                          <div className="p-3 border-t">
                            <div className="flex items-center gap-2">
                              <label className="text-sm font-medium">
                                Heure :
                              </label>
                              <Input
                                type="time"
                                value={
                                  watch("startsAt") &&
                                  watch("startsAt") instanceof Date &&
                                  !isNaN(watch("startsAt")!.getTime())
                                    ? format(watch("startsAt")!, "HH:mm")
                                    : ""
                                }
                                onChange={(e) => {
                                  const currentValue = watch("startsAt");
                                  if (currentValue) {
                                    const [hours, minutes] =
                                      e.target.value.split(":");
                                    const newDate = new Date(currentValue);
                                    newDate.setHours(parseInt(hours));
                                    newDate.setMinutes(parseInt(minutes));
                                    setValue("startsAt", newDate);
                                  }
                                }}
                                className="w-32"
                              />
                            </div>
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Date d'expiration */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Date d&#39;expiration (optionnel)
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-10 pl-3 text-left font-normal",
                            !watch("expiresAt") && "text-muted-foreground"
                          )}
                        >
                          {watch("expiresAt") ? (
                            format(watch("expiresAt")!, "PPP 'à' HH:mm", {
                              locale: fr,
                            })
                          ) : (
                            <span>Sélectionner une date et heure</span>
                          )}
                          <IconCalendar className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={watch("expiresAt")}
                          onSelect={(date) => {
                            if (date) {
                              // Si une date existe déjà, conserver l'heure
                              if (watch("expiresAt")) {
                                const newDate = new Date(date);
                                const currentValue = watch("expiresAt")!;
                                newDate.setHours(currentValue.getHours());
                                newDate.setMinutes(currentValue.getMinutes());
                                setValue("expiresAt", newDate);
                              } else {
                                // Nouvelle date, définir à 23:59 pour l'expiration
                                date.setHours(23);
                                date.setMinutes(59);
                                setValue("expiresAt", date);
                              }
                            } else {
                              setValue("expiresAt", date);
                            }
                          }}
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return date < today;
                          }}
                          initialFocus
                        />
                        {watch("expiresAt") && (
                          <div className="p-3 border-t">
                            <div className="flex items-center gap-2">
                              <label className="text-sm font-medium">
                                Heure :
                              </label>
                              <Input
                                type="time"
                                value={
                                  watch("expiresAt") &&
                                  watch("expiresAt") instanceof Date &&
                                  !isNaN(watch("expiresAt")!.getTime())
                                    ? format(watch("expiresAt")!, "HH:mm")
                                    : ""
                                }
                                onChange={(e) => {
                                  const currentValue = watch("expiresAt");
                                  if (currentValue) {
                                    const [hours, minutes] =
                                      e.target.value.split(":");
                                    const newDate = new Date(currentValue);
                                    newDate.setHours(parseInt(hours));
                                    newDate.setMinutes(parseInt(minutes));
                                    setValue("expiresAt", newDate);
                                  }
                                }}
                                className="w-32"
                              />
                            </div>
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Statut actif */}
                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium text-gray-700 dark:text-gray-300">
                      Statut
                    </Label>
                    <div className="text-sm text-muted-foreground">
                      {watch("isActive")
                        ? "Réduction active"
                        : "Réduction inactive"}
                    </div>
                  </div>
                  <Switch
                    checked={watch("isActive")}
                    onCheckedChange={(checked) => setValue("isActive", checked)}
                    className={`scale-125 ${
                      watch("isActive")
                        ? "data-[state=checked]:bg-green-500"
                        : ""
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Statistiques */}
            <div className="space-y-5">
              <div className="flex items-center gap-3 pb-2">
                <div className="flex items-center justify-center w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                  <IconTicket className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Statistiques d&#39;utilisation
                </h3>
              </div>

              <div className="bg-white dark:bg-card border dark:border-gray-700 rounded-lg p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {discount.usedCount}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Utilisations
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {discount.maxUses
                        ? `${discount.maxUses - discount.usedCount}`
                        : "∞"}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Restantes
                    </div>
                  </div>
                </div>
                {discount.maxUses && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span>Progression</span>
                      <span>
                        {Math.round(
                          (discount.usedCount / discount.maxUses) * 100
                        )}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            (discount.usedCount / discount.maxUses) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <SheetFooter className="px-6 py-4 border-t bg-gray-50/50 dark:bg-card/50">
            <div className="flex flex-col md:flex-row items-center gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="w-full md:flex-1 h-11 cursor-pointer"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full md:flex-1 h-11 bg-primary cursor-pointer"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Mise à jour...
                  </div>
                ) : (
                  "Mettre à jour la réduction"
                )}
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
