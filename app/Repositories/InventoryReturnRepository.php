<?php

namespace App\Repositories;

use App\Models\InventoryReturn;
use Illuminate\Support\Carbon;

class InventoryReturnRepository extends BaseRepository
{
    public function __construct(InventoryReturn $inventoryReturn) {
        parent::__construct($inventoryReturn);
    }

    public function parse(array $data): array
    {
        $data['returned_at'] = isset($data['returned_at']) ? Carbon::parse($data['returned_at']) : now();

        if (isset($data['meta']) && is_array($data['meta'])) {
            $data['meta'] = array_filter($data['meta']);
        }

        return $data;
    }
}
