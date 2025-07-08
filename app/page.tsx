"use client"

import type React from "react"

import { useState } from "react"
import { Search, Package, Download, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Item {
  id: string
  materialId: string
  name: string
  brand: string
  stock: number
  category: string
}

interface Transaction {
  id: string
  date: string
  itemName: string
  quantity: number
  action: "masuk" | "keluar"
  timestamp: number
}

const initialItems: Item[] = [
  { id: "1", materialId: "PEN-001", name: "Pensil 2B", brand: "Faber Castell", stock: 50, category: "Alat Tulis" },
  { id: "2", materialId: "PEN-002", name: "Pensil 2B", brand: "Staedtler", stock: 30, category: "Alat Tulis" },
  { id: "3", materialId: "PUL-001", name: "Pulpen", brand: "Pilot", stock: 25, category: "Alat Tulis" },
  { id: "4", materialId: "PUL-002", name: "Pulpen", brand: "Zebra", stock: 20, category: "Alat Tulis" },
  { id: "5", materialId: "SPI-001", name: "Spidol", brand: "Snowman", stock: 12, category: "Alat Tulis" },
  { id: "6", materialId: "SPI-002", name: "Spidol", brand: "Pilot", stock: 8, category: "Alat Tulis" },
  { id: "7", materialId: "ERA-001", name: "Penghapus", brand: "Faber Castell", stock: 15, category: "Alat Tulis" },
  { id: "8", materialId: "RUL-001", name: "Penggaris 30cm", brand: "Butterfly", stock: 10, category: "Alat Tulis" },
  { id: "9", materialId: "PAP-001", name: "Kertas A4", brand: "SiDU", stock: 100, category: "Kertas" },
  { id: "10", materialId: "STA-001", name: "Stapler", brand: "Kenko", stock: 5, category: "Alat Kantor" },
]

export default function InventoryApp() {
  const [items, setItems] = useState<Item[]>(initialItems)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedItem, setSelectedItem] = useState("")
  const [quantity, setQuantity] = useState("")
  const [action, setAction] = useState<"masuk" | "keluar">("masuk")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMaterial, setNewMaterial] = useState({
    name: "",
    brand: "",
    category: "",
    initialStock: "",
  })

  // Filter items for autocomplete
  const filteredItems = items.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))

  // Handle item selection from autocomplete
  const handleItemSelect = (item: Item) => {
    setSelectedItem(`${item.name} - ${item.brand} (${item.materialId})`)
    setSearchTerm(`${item.name} - ${item.brand}`)
    setShowSuggestions(false)
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedItem || !quantity || Number.parseInt(quantity) <= 0) {
      alert("Mohon lengkapi semua field dengan benar!")
      return
    }

    const item = items.find((i) => `${i.name} - ${i.brand} (${i.materialId})` === selectedItem)
    if (!item) {
      alert("Barang tidak ditemukan!")
      return
    }

    const qty = Number.parseInt(quantity)

    // Check if stock is sufficient for "keluar" action
    if (action === "keluar" && item.stock < qty) {
      alert("Stok tidak mencukupi!")
      return
    }

    // Update stock
    const updatedItems = items.map((i) => {
      if (`${i.name} - ${i.brand} (${i.materialId})` === selectedItem) {
        return {
          ...i,
          stock: action === "masuk" ? i.stock + qty : i.stock - qty,
        }
      }
      return i
    })
    setItems(updatedItems)

    // Add transaction
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString("id-ID"),
      itemName: selectedItem,
      quantity: qty,
      action,
      timestamp: Date.now(),
    }
    setTransactions((prev) => [newTransaction, ...prev])

    // Reset form
    setSelectedItem("")
    setSearchTerm("")
    setQuantity("")
    setAction("masuk")
  }

  // Export to Excel (CSV format)
  const exportToExcel = () => {
    const csvContent = [
      ["Tanggal", "Nama Barang", "Jumlah", "Aksi"],
      ...transactions.map((t) => [
        t.date,
        t.itemName,
        t.quantity.toString(),
        t.action === "masuk" ? "Barang Masuk" : "Barang Keluar",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `riwayat-stok-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMaterial.name || !newMaterial.brand || !newMaterial.category || !newMaterial.initialStock) {
      alert("Mohon lengkapi semua field!")
      return
    }

    // Generate new material ID
    const categoryPrefix = newMaterial.category.substring(0, 3).toUpperCase()
    const existingIds = items
      .filter((item) => item.materialId.startsWith(categoryPrefix))
      .map((item) => Number.parseInt(item.materialId.split("-")[1]))
    const nextId = Math.max(...existingIds, 0) + 1
    const materialId = `${categoryPrefix}-${nextId.toString().padStart(3, "0")}`

    const newItem: Item = {
      id: Date.now().toString(),
      materialId,
      name: newMaterial.name,
      brand: newMaterial.brand,
      stock: Number.parseInt(newMaterial.initialStock),
      category: newMaterial.category,
    }

    setItems((prev) => [...prev, newItem])
    setNewMaterial({ name: "", brand: "", category: "", initialStock: "" })
    setShowAddForm(false)

    alert(`Material baru berhasil ditambahkan dengan ID: ${materialId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <Package className="h-8 w-8" />📦 Stok Barang Kantor
          </h1>
        </div>

        {/* Add Material Button */}
        <div className="flex justify-center">
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {showAddForm ? "Tutup Form" : "Tambah Material Baru"}
          </Button>
        </div>

        {/* Main Form */}
        <Card>
          <CardHeader>
            <CardTitle>Input Transaksi Barang</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Search with Autocomplete */}
              <div className="relative">
                <label className="block text-sm font-medium mb-2">🔍 Cari Barang:</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setSelectedItem(e.target.value)
                      setShowSuggestions(true)
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Ketik nama barang..."
                    className="pl-10"
                  />
                </div>

                {/* Autocomplete Suggestions */}
                {showSuggestions && searchTerm && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredItems.length > 0 ? (
                      filteredItems.map((item) => (
                        <div
                          key={item.id}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleItemSelect(item)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">
                                {item.name} - {item.brand}
                              </div>
                              <div className="text-xs text-gray-500">ID: {item.materialId}</div>
                            </div>
                            <Badge variant="secondary">Stok: {item.stock}</Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500">Barang tidak ditemukan</div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Item Display */}
              <div>
                <label className="block text-sm font-medium mb-2">📋 Nama Barang:</label>
                <Input
                  type="text"
                  value={selectedItem}
                  readOnly
                  placeholder="Pilih barang dari pencarian di atas"
                  className="bg-gray-50"
                />
              </div>

              {/* Quantity Input */}
              <div>
                <label className="block text-sm font-medium mb-2">🔢 Jumlah:</label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Masukkan jumlah"
                  min="1"
                />
              </div>

              {/* Action Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">⬇️ Aksi:</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="action"
                      value="masuk"
                      checked={action === "masuk"}
                      onChange={(e) => setAction(e.target.value as "masuk" | "keluar")}
                      className="text-green-600"
                    />
                    <Plus className="h-4 w-4 text-green-600" />
                    <span>Barang Masuk</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="action"
                      value="keluar"
                      checked={action === "keluar"}
                      onChange={(e) => setAction(e.target.value as "masuk" | "keluar")}
                      className="text-red-600"
                    />
                    <Minus className="h-4 w-4 text-red-600" />
                    <span>Barang Keluar</span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                🟢 Submit
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Add New Material Form */}
        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle>➕ Tambah Material Baru</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddMaterial} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nama Material:</label>
                    <Input
                      type="text"
                      value={newMaterial.name}
                      onChange={(e) => setNewMaterial((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Contoh: Pulpen, Spidol, dll"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Merk:</label>
                    <Input
                      type="text"
                      value={newMaterial.brand}
                      onChange={(e) => setNewMaterial((prev) => ({ ...prev, brand: e.target.value }))}
                      placeholder="Contoh: Pilot, Faber Castell, dll"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Kategori:</label>
                    <select
                      value={newMaterial.category}
                      onChange={(e) => setNewMaterial((prev) => ({ ...prev, category: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Pilih Kategori</option>
                      <option value="Alat Tulis">Alat Tulis</option>
                      <option value="Kertas">Kertas</option>
                      <option value="Alat Kantor">Alat Kantor</option>
                      <option value="Elektronik">Elektronik</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Stok Awal:</label>
                    <Input
                      type="number"
                      value={newMaterial.initialStock}
                      onChange={(e) => setNewMaterial((prev) => ({ ...prev, initialStock: e.target.value }))}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Tambah Material
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                    Batal
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Current Stock Display */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>📊 Stok Saat Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <div className="font-medium">
                        {item.name} - {item.brand}
                      </div>
                      <div className="text-xs text-gray-500">ID: {item.materialId}</div>
                    </div>
                    <Badge variant={item.stock < 10 ? "destructive" : "secondary"}>{item.stock}</Badge>
                  </div>
                  <div className="text-xs text-gray-400">{item.category}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>📈 Riwayat Terbaru</CardTitle>
            <Button
              onClick={exportToExcel}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-transparent"
            >
              <Download className="h-4 w-4" />
              Export Excel
            </Button>
          </CardHeader>
          <CardContent>
            {transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Tanggal</th>
                      <th className="text-left p-2 font-medium">Nama Barang</th>
                      <th className="text-left p-2 font-medium">Jumlah</th>
                      <th className="text-left p-2 font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 10).map((transaction) => (
                      <tr key={transaction.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">{transaction.date}</td>
                        <td className="p-2">{transaction.itemName}</td>
                        <td className="p-2">{transaction.quantity}</td>
                        <td className="p-2">
                          <Badge
                            variant={transaction.action === "masuk" ? "default" : "destructive"}
                            className={transaction.action === "masuk" ? "bg-green-600" : ""}
                          >
                            {transaction.action === "masuk" ? "Barang Masuk" : "Barang Keluar"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">Belum ada transaksi</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
