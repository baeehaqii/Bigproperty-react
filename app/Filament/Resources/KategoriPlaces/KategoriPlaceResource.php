<?php

namespace App\Filament\Resources\KategoriPlaces;

use App\Filament\Resources\KategoriPlaces\Pages\CreateKategoriPlace;
use App\Filament\Resources\KategoriPlaces\Pages\EditKategoriPlace;
use App\Filament\Resources\KategoriPlaces\Pages\ListKategoriPlaces;
use App\Filament\Resources\KategoriPlaces\Schemas\KategoriPlaceForm;
use App\Filament\Resources\KategoriPlaces\Tables\KategoriPlacesTable;
use App\Models\KategoriPlace;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class KategoriPlaceResource extends Resource
{
    protected static ?string $model = KategoriPlace::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static ?string $recordTitleAttribute = 'KategoriPlace';
    protected static ?string $navigationLabel = 'Kategori Nearby Place';
    protected static string|\UnitEnum|null $navigationGroup = 'Master Data';
    protected static ?int $navigationSort = 2;

    public static function form(Schema $schema): Schema
    {
        return KategoriPlaceForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return KategoriPlacesTable::configure($table);
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
            'index' => ListKategoriPlaces::route('/'),
            'create' => CreateKategoriPlace::route('/create'),
            'edit' => EditKategoriPlace::route('/{record}/edit'),
        ];
    }
}
