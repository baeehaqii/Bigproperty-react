<?php

namespace App\Filament\Resources\GolderDeals;

use App\Filament\Resources\GolderDeals\Pages\CreateGolderDeals;
use App\Filament\Resources\GolderDeals\Pages\EditGolderDeals;
use App\Filament\Resources\GolderDeals\Pages\ListGolderDeals;
use App\Filament\Resources\GolderDeals\Schemas\GolderDealsForm;
use App\Filament\Resources\GolderDeals\Tables\GolderDealsTable;
use App\Models\GoldenDealsProperty;
use App\Models\GolderDeals;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class GolderDealsResource extends Resource
{
    protected static ?string $model = GoldenDealsProperty::class;

    protected static string|\UnitEnum|null $navigationGroup = 'Content';
    protected static ?string $navigationLabel = 'Golden Deals';
    protected static ?string $modelLabel = 'Data Golden Deals';
    protected static ?string $pluralModelLabel = 'Golden Deals';
    protected static ?string $slug = 'golden-deals';
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static ?string $recordTitleAttribute = 'GoldenDealsProperty';

    public static function form(Schema $schema): Schema
    {
        return GolderDealsForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return GolderDealsTable::configure($table);
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
            'index' => ListGolderDeals::route('/'),
            'create' => CreateGolderDeals::route('/create'),
            'edit' => EditGolderDeals::route('/{record}/edit'),
        ];
    }
}
