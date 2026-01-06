<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeadsAgent extends Model
{
    protected $table = 'leads_agents';

    protected $fillable = [
        'nama_lengkap',
        'no_whatsapp',
        'email',
        'listing_source',
        'property_id',
        'agent_id',
        'status_lead',
        'status_followup',
        'tanggal_leads',
        'notes',
        'contact_source', // 'phone' atau 'whatsapp'
    ];

    protected $casts = [
        'tanggal_leads' => 'date',
    ];

    /**
     * Get the agent that owns this lead.
     */
    public function agent(): BelongsTo
    {
        return $this->belongsTo(Agen::class, 'agent_id');
    }

    /**
     * Get the property associated with this lead.
     */
    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class, 'property_id');
    }
}
