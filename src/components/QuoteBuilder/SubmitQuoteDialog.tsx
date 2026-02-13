import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { FurnitureItem } from "@/types/quote";

interface SubmitQuoteDialogProps {
  items: FurnitureItem[];
  totalCost: number;
  projectName: string;
  disabled?: boolean;
}

export function SubmitQuoteDialog({ items, totalCost, projectName, disabled }: SubmitQuoteDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    message: "",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call - in production, this would send to your admin email or Honeybook
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Create quote summary for email
    const quoteSummary = {
      projectName,
      client: formData,
      items: items.map(item => ({
        room: item.roomName,
        product: item.productName,
        supplier: item.supplier,
        sku: item.sku,
        quantity: item.quantity,
        baseCost: item.baseCost,
        finalPrice: item.finalPrice,
        notes: item.notes,
      })),
      totalCost,
      submittedAt: new Date().toISOString(),
    };

    console.log("Quote submitted:", quoteSummary);

    toast({
      title: "Quote Submitted!",
      description: "Your furniture quote has been sent successfully. We'll be in touch soon.",
    });

    setIsSubmitting(false);
    setOpen(false);
    setFormData({ clientName: "", clientEmail: "", clientPhone: "", message: "" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2" disabled={disabled}>
          <Send className="w-4 h-4" />
          Submit Quote
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Submit Your Quote</DialogTitle>
          <DialogDescription>
            Enter your details and we'll send this quote to our team for review.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="clientName">Your Name *</Label>
            <Input
              id="clientName"
              required
              value={formData.clientName}
              onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
              placeholder="John Smith"
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientEmail">Email Address *</Label>
            <Input
              id="clientEmail"
              type="email"
              required
              value={formData.clientEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
              placeholder="john@example.com"
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientPhone">Phone Number</Label>
            <Input
              id="clientPhone"
              type="tel"
              value={formData.clientPhone}
              onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
              placeholder="(555) 123-4567"
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Additional Notes</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Any special requests or timeline requirements..."
              className="bg-background resize-none"
              rows={3}
            />
          </div>

          <div className="bg-muted rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Items in quote:</span>
              <span className="font-medium">{items.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total estimate:</span>
              <span className="text-lg font-semibold text-accent">
                ${totalCost.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Quote Request
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
