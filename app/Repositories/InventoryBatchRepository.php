<?php

namespace App\Repositories;

use App\Models\InventoryBatch;

class InventoryBatchRepository extends BaseRepository
{
    public function __construct(InventoryBatch $inventoryBatch) {
        parent::__construct($inventoryBatch);
    }

    public function parse(array $data): array
    {
        if (isset($data['meta']) && is_array($data['meta'])) {
            $data['meta'] = array_filter($data['meta']);
        }

        return $data;
    }
}
