<?php

namespace App\Filament\Resources\Users\Pages;

use App\Filament\Resources\Users\UserResource;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;

class CreateUser extends CreateRecord
{
    protected static string $resource = UserResource::class;
    
    // Di Filament v4, gunakan method ini dengan parameter Model
    protected function afterCreate(): void
    {
        $user = $this->getRecord(); // Gunakan getRecord() untuk Filament v4

        \App\Models\KreditUser::create([
            'user_id' => $user->id,
            'kredit_new_user' => 3,
            'kredit_listing' => 0,
            'kredit_highlight' => 0,
            'kredit_popup' => 0,
            'kredit_banner' => 0,
        ]);

        Notification::make()
            ->title('Kredit berhasil ditambahkan')
            ->success()
            ->send();
    }
}