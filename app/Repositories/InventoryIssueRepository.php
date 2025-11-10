<?php

namespace App\Repositories;

use App\Models\InventoryIssue;
use Illuminate\Support\Carbon;

class InventoryIssueRepository extends BaseRepository
{
    public function __construct(InventoryIssue $inventoryIssue) {
        parent::__construct($inventoryIssue);
    }

    public function parse(array $data): array
    {
        if (isset($data['issued_at'])) {
            $data['issued_at'] = Carbon::parse($data['issued_at']);
        }

        return $data;
    }
}
