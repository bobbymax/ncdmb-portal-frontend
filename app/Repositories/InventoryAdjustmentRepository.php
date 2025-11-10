<?php

namespace App\Repositories;

use App\Models\InventoryAdjustment;
use Illuminate\Support\Carbon;

class InventoryAdjustmentRepository extends BaseRepository
{
    public function __construct(InventoryAdjustment $inventoryAdjustment) {
        parent::__construct($inventoryAdjustment);
    }

    public function parse(array $data): array
    {
        $data['adjusted_at'] = isset($data['adjusted_at']) ? Carbon::parse($data['adjusted_at']) : now();

        if (isset($data['meta']) && is_array($data['meta'])) {
            $data['meta'] = array_filter($data['meta']);
        }

        return $data;
    }
}
