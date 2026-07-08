import React from 'react';
import { Package, Plus, ClipboardList, Search } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function QuickActions() {
  return (
    <div className="flex gap-4">
      <Button variant="secondary" className="flex items-center gap-2"><Plus size={16} /> Create Product</Button>
      <Button variant="secondary" className="flex items-center gap-2"><Package size={16} /> Import Batch</Button>
      <Button variant="secondary" className="flex items-center gap-2"><ClipboardList size={16} /> Create Warranty Claim</Button>
    </div>
  );
}
