<?php

namespace App\Repositories;

use App\Models\InventoryBalance;

class InventoryBalanceRepository extends BaseRepository
{
    public function __construct(InventoryBalance $inventoryBalance) {
        parent::__construct($inventoryBalance);
    }

    public function parse(array $data): array
    {
        return [
            ...$data,
            'on_hand' => $data['on_hand'] ?? 0,
            'reserved' => $data['reserved'] ?? 0,
            'available' => $data['available'] ?? ($data['on_hand'] ?? 0) - ($data['reserved'] ?? 0),
        ];
    }

    public function upsert(int $productId, ?int $measurementId, int $locationId, array $attributes = []): InventoryBalance
    {
        return $this->model->newQuery()->firstOrCreate([
            'product_id' => $productId,
            'product_measurement_id' => $measurementId,
            'location_id' => $locationId,
        ], [
            'on_hand' => $attributes['on_hand'] ?? 0,
            'reserved' => $attributes['reserved'] ?? 0,
            'available' => $attributes['available'] ?? 0,
            'unit_cost' => $attributes['unit_cost'] ?? 0,
        ]);
    }
}
