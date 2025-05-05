'use client';

import { useState } from 'react';
import Link from 'next/link';

interface IncomingPurchase {
  id: string;
  purchase_type: 'po_shipment' | 'manual_purchase';
  supplier_name: string;
  supplier_id?: string;
  purchaser_name: string;
  role_id: string;
  po_number?: string;
  invoice_number?: string;
  invoice_url?: string;
  transport_info?: {
    carrier?: string;
    vehicle_id?: string;
    driver_name?: string;
  };
  arrival_time: string;
  location_received: string;
  items: Array<{
    item_name: string;
    sku?: string;
    quantity: number;
    unit: string;
    batch_id?: string;
    inspection_status?: 'pending' | 'approved' | 'rejected';
    storage_location?: string;
  }>;
  linked_issue_id?: string;
  qa_tag?: string;
  payment_method?: 'company_card' | 'cash' | 'invoice';
  notes?: string;
  consent_tags: string[];
  created_at: string;
  created_by: string;
  audit_trail_id?: string;
}

interface IncomingContainer {
  id: string;
  incoming_purchase_id: string;
  label_or_code: string;
  description?: string;
  quantity_estimate?: number;
  unit: string;
  status: 'unopened' | 'inspected' | 'classified';
  received_at: string;
  storage_temp?: string;
  remarks?: string;
}

interface ClassifiedItem {
  id: string;
  container_id: string;
  item_name: string;
  sku?: string;
  actual_quantity: number;
  unit: string;
  batch_id?: string;
  classification_method?: 'visual' | 'sample-tested' | 'vendor-declared';
  inspector_name?: string;
  classification_time?: string;
}

interface ProductCategory {
  id: string;
  name: string;
  requires_batch_id: boolean;
  requires_qc_before_stock: boolean;
  requires_storage_temp: boolean;
  default_uom: string;
}

interface SKU {
  id: string;
  name: string;
  category_id: string;
}

export default function IncomingPage() {
  const [formType, setFormType] = useState<'regular' | 'unknown'>('regular');
  const [form, setForm] = useState<Partial<IncomingPurchase>>({
    purchase_type: 'po_shipment',
    items: [{
      item_name: '',
      quantity: 0,
      unit: '',
    }],
    consent_tags: [],
  });
  const [containers, setContainers] = useState<Partial<IncomingContainer>[]>([{
    status: 'unopened',
    unit: '',
  }]);
  const [currentSection, setCurrentSection] = useState(1);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      // TODO: Implement form submission
      console.log('Form data:', formType === 'regular' ? form : containers);
      setMessage({ text: '✅ Form submitted successfully', type: 'success' });
    } catch (error) {
      setMessage({ text: '❌ Error submitting form', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addItem = () => {
    if (formType === 'regular') {
      setForm(prev => ({
        ...prev,
        items: [...(prev.items || []), {
          item_name: '',
          quantity: 0,
          unit: '',
        }]
      }));
    } else {
      setContainers(prev => [...prev, {
        status: 'unopened',
        unit: '',
      }]);
    }
  };

  const removeItem = (index: number) => {
    if (formType === 'regular') {
      setForm(prev => ({
        ...prev,
        items: prev.items?.filter((_, i) => i !== index)
      }));
    } else {
      setContainers(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    if (formType === 'regular') {
      setForm(prev => ({
        ...prev,
        items: prev.items?.map((item, i) => 
          i === index ? { ...item, [field]: value } : item
        )
      }));
    } else {
      setContainers(prev => prev.map((container, i) =>
        i === index ? { ...container, [field]: value } : container
      ));
    }
  };

  const renderSection = () => {
    if (formType === 'unknown') {
      return renderUnknownContentSection();
    }

    switch (currentSection) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Purchase Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purchase Type *
                </label>
                <select
                  value={form.purchase_type}
                  onChange={(e) => setForm({ ...form, purchase_type: e.target.value as 'po_shipment' | 'manual_purchase' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="po_shipment">PO Shipment</option>
                  <option value="manual_purchase">Manual Purchase</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier Name *
                </label>
                <input
                  type="text"
                  value={form.supplier_name || ''}
                  onChange={(e) => setForm({ ...form, supplier_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier ID
                </label>
                <input
                  type="text"
                  value={form.supplier_id || ''}
                  onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purchaser Name *
                </label>
                <input
                  type="text"
                  value={form.purchaser_name || ''}
                  onChange={(e) => setForm({ ...form, purchaser_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role ID *
                </label>
                <input
                  type="text"
                  value={form.role_id || ''}
                  onChange={(e) => setForm({ ...form, role_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              {form.purchase_type === 'po_shipment' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PO Number
                  </label>
                  <input
                    type="text"
                    value={form.po_number || ''}
                    onChange={(e) => setForm({ ...form, po_number: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Transport & Arrival</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Arrival Time *
                </label>
                <input
                  type="datetime-local"
                  value={form.arrival_time || ''}
                  onChange={(e) => setForm({ ...form, arrival_time: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location Received *
                </label>
                <input
                  type="text"
                  value={form.location_received || ''}
                  onChange={(e) => setForm({ ...form, location_received: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Carrier
                </label>
                <input
                  type="text"
                  value={form.transport_info?.carrier || ''}
                  onChange={(e) => setForm({
                    ...form,
                    transport_info: { ...form.transport_info, carrier: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle ID
                </label>
                <input
                  type="text"
                  value={form.transport_info?.vehicle_id || ''}
                  onChange={(e) => setForm({
                    ...form,
                    transport_info: { ...form.transport_info, vehicle_id: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Driver Name
                </label>
                <input
                  type="text"
                  value={form.transport_info?.driver_name || ''}
                  onChange={(e) => setForm({
                    ...form,
                    transport_info: { ...form.transport_info, driver_name: e.target.value }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Items</h2>
            {form.items?.map((item, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Item {index + 1}</h3>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      value={item.item_name}
                      onChange={(e) => updateItem(index, 'item_name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SKU
                    </label>
                    <input
                      type="text"
                      value={item.sku || ''}
                      onChange={(e) => updateItem(index, 'sku', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit *
                    </label>
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => updateItem(index, 'unit', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Batch ID
                    </label>
                    <input
                      type="text"
                      value={item.batch_id || ''}
                      onChange={(e) => updateItem(index, 'batch_id', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Inspection Status
                    </label>
                    <select
                      value={item.inspection_status || ''}
                      onChange={(e) => updateItem(index, 'inspection_status', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Storage Location
                    </label>
                    <input
                      type="text"
                      value={item.storage_location || ''}
                      onChange={(e) => updateItem(index, 'storage_location', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addItem}
              className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Add Another Item
            </button>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Additional Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Number
                </label>
                <input
                  type="text"
                  value={form.invoice_number || ''}
                  onChange={(e) => setForm({ ...form, invoice_number: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice URL
                </label>
                <input
                  type="text"
                  value={form.invoice_url || ''}
                  onChange={(e) => setForm({ ...form, invoice_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={form.payment_method || ''}
                  onChange={(e) => setForm({ ...form, payment_method: e.target.value as 'company_card' | 'cash' | 'invoice' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Method</option>
                  <option value="company_card">Company Card</option>
                  <option value="cash">Cash</option>
                  <option value="invoice">Invoice</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  QA Tag
                </label>
                <input
                  type="text"
                  value={form.qa_tag || ''}
                  onChange={(e) => setForm({ ...form, qa_tag: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={form.notes || ''}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderUnknownContentSection = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Unknown Content Containers</h2>
        {containers.map((container, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Container {index + 1}</h3>
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Label/Code *
                </label>
                <input
                  type="text"
                  value={container.label_or_code || ''}
                  onChange={(e) => updateItem(index, 'label_or_code', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={container.description || ''}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity Estimate
                </label>
                <input
                  type="number"
                  min="0"
                  value={container.quantity_estimate || ''}
                  onChange={(e) => updateItem(index, 'quantity_estimate', parseFloat(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit *
                </label>
                <input
                  type="text"
                  value={container.unit || ''}
                  onChange={(e) => updateItem(index, 'unit', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  value={container.status || 'unopened'}
                  onChange={(e) => updateItem(index, 'status', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="unopened">Unopened</option>
                  <option value="inspected">Inspected</option>
                  <option value="classified">Classified</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Storage Temperature
                </label>
                <input
                  type="text"
                  value={container.storage_temp || ''}
                  onChange={(e) => updateItem(index, 'storage_temp', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks
                </label>
                <textarea
                  value={container.remarks || ''}
                  onChange={(e) => updateItem(index, 'remarks', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Add Another Container
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Incoming Goods Form</h1>
          <Link 
            href="/"
            className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-8">
            <div className="flex space-x-4 mb-6">
              <button
                type="button"
                onClick={() => setFormType('regular')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  formType === 'regular'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Regular Purchase
              </button>
              <button
                type="button"
                onClick={() => setFormType('unknown')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  formType === 'unknown'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Unknown Contents
              </button>
            </div>

            {formType === 'regular' && (
              <div className="flex justify-between items-center">
                {[
                  { number: 1, title: 'Purchase Information' },
                  { number: 2, title: 'Transport & Arrival' },
                  { number: 3, title: 'Items' },
                  { number: 4, title: 'Additional Information' }
                ].map((section) => (
                  <button
                    key={section.number}
                    onClick={() => setCurrentSection(section.number)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      currentSection === section.number
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {section.number}. {section.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {renderSection()}

            {message && (
              <div className={`p-4 rounded-lg ${
                message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {message.text}
              </div>
            )}

            <div className="flex justify-between pt-6">
              {formType === 'regular' && currentSection > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentSection(currentSection - 1)}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Previous
                </button>
              )}
              {formType === 'regular' && currentSection < 4 ? (
                <button
                  type="button"
                  onClick={() => setCurrentSection(currentSection + 1)}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors ml-auto"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2 rounded-lg text-white transition-colors ml-auto ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 