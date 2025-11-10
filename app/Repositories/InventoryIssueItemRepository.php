<?php

namespace App\Repositories;

use App\Models\InventoryIssueItem;

class InventoryIssueItemRepository extends BaseRepository
{
    public function __construct(InventoryIssueItem $inventoryIssueItem) {
        parent::__construct($inventoryIssueItem);
    }

    public function parse(array $data): array
    {
        $data['quantity_issued'] = $data['quantity_issued'] ?? 0;
        $data['unit_cost'] = $data['unit_cost'] ?? 0;

        return $data;
    }
}
