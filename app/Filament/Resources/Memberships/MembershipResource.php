<?php

namespace App\Filament\Resources\Memberships;

use App\Filament\Resources\Memberships\Pages\CreateMembership;
use App\Filament\Resources\Memberships\Pages\EditMembership;
use App\Filament\Resources\Memberships\Pages\ListMemberships;
use App\Filament\Resources\Memberships\Schemas\MembershipForm;
use App\Filament\Resources\Memberships\Tables\MembershipsTable;
use App\Models\Membership;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class MembershipResource extends Resource
{
    protected static ?string $model = Membership::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static ?string $navigationLabel = 'Memberships & Listing';
    protected static string|\UnitEnum|null $navigationGroup = 'Memberships & Listing';
    protected static ?string $modelLabel = 'Data Memberships & Listing';
    protected static ?string $pluralModelLabel = 'Memberships & Listing';
    protected static ?string $recordTitleAttribute = 'Memberships & Listing';

    public static function form(Schema $schema): Schema
    {
        return MembershipForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return MembershipsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListMemberships::route('/'),
            'create' => CreateMembership::route('/create'),
            'edit' => EditMembership::route('/{record}/edit'),
        ];
    }
}
