<?php

namespace App\Services;

use App\Repositories\InventoryLocationRepository;

class InventoryLocationService extends BaseService
{
    public function __construct(InventoryLocationRepository $inventoryLocationRepository)
    {
        parent::__construct($inventoryLocationRepository);
    }

    public function rules($action = "store"): array
    {
        $locationId = request()->route('inventory_location');
        if ($locationId instanceof \App\Models\InventoryLocation) {
            $locationId = $locationId->getKey();
        }

        return [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:inventory_locations,code' . ($action === 'update' && $locationId ? ',' . $locationId : ''),
            'type' => 'required|in:warehouse,site,vehicle,office',
            'department_id' => 'nullable|exists:departments,id',
            'parent_id' => 'nullable|exists:inventory_locations,id',
            'meta' => 'nullable|array',
        ];
    }
}
