<?php

namespace App\Repositories;

use App\Models\InventoryTransaction;
use Illuminate\Support\Carbon;

class InventoryTransactionRepository extends BaseRepository
{
    public function __construct(InventoryTransaction $inventoryTransaction) {
        parent::__construct($inventoryTransaction);
    }

    public function parse(array $data): array
    {
        $data['transacted_at'] = isset($data['transacted_at'])
            ? Carbon::parse($data['transacted_at'])
            : now();

        if (isset($data['meta']) && is_array($data['meta'])) {
            $data['meta'] = array_filter($data['meta']);
        }

        return $data;
    }
}
