<?php

namespace App\Http\Controllers;

use App\Models\LeadsAgent;
use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LeadsAgentController extends Controller
{
    /**
     * Store a new lead from property detail page
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama_lengkap' => ['required', 'string', 'max:255'],
            'no_whatsapp' => ['required', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'property_id' => ['required', 'exists:properties,id'],
            'contact_source' => ['nullable', 'string', 'in:phone,whatsapp'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // Get the property to find the agent
            $property = Property::findOrFail($request->property_id);

            // Format nomor WhatsApp dengan prefix +62
            $phoneNumber = $request->no_whatsapp;
            // Hapus awalan 0 jika ada dan tambahkan +62
            $phoneNumber = preg_replace('/^0/', '', $phoneNumber);
            // Jika belum ada prefix 62, tambahkan
            if (!preg_match('/^(\+62|62)/', $phoneNumber)) {
                $phoneNumber = '+62' . $phoneNumber;
            }

            // Create the lead
            $lead = LeadsAgent::create([
                'nama_lengkap' => $request->nama_lengkap,
                'no_whatsapp' => $phoneNumber,
                'email' => $request->email,
                'listing_source' => $property->name,
                'property_id' => $property->id,
                'agent_id' => $property->agen_id,
                'status_lead' => 'cold',
                'status_followup' => 'belum',
                'tanggal_leads' => now()->toDateString(),
                'contact_source' => $request->contact_source ?? 'whatsapp',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Lead berhasil disimpan! Agent akan segera menghubungi Anda.',
                'data' => $lead,
            ]);

        } catch (\Exception $e) {
            \Log::error('Lead creation error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan. Silakan coba lagi.',
            ], 500);
        }
    }
}
