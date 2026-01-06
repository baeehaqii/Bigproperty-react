<?php

namespace App\Filament\Resources\NearbyPlaces;

use App\Filament\Resources\NearbyPlaces\Pages\CreateNearbyPlace;
use App\Filament\Resources\NearbyPlaces\Pages\EditNearbyPlace;
use App\Filament\Resources\NearbyPlaces\Pages\ListNearbyPlaces;
use App\Filament\Resources\NearbyPlaces\Schemas\NearbyPlaceForm;
use App\Filament\Resources\NearbyPlaces\Tables\NearbyPlacesTable;
use App\Models\NearbyPlace;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class NearbyPlaceResource extends Resource
{
    protected static ?string $model = NearbyPlace::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static ?string $recordTitleAttribute = 'NearbyPlace';
    protected static ?string $navigationLabel = 'Nearby Place';
    protected static string|\UnitEnum|null $navigationGroup = 'Master Data';
    protected static ?int $navigationSort = 4;

    public static function form(Schema $schema): Schema
    {
        return NearbyPlaceForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return NearbyPlacesTable::configure($table);
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
            'index' => ListNearbyPlaces::route('/'),
            'create' => CreateNearbyPlace::route('/create'),
            'edit' => EditNearbyPlace::route('/{record}/edit'),
        ];
    }
}
