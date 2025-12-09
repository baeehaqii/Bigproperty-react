<?php

namespace App\Filament\Resources\Developers;

use App\Filament\Resources\Developers\Pages\CreateDeveloper;
use App\Filament\Resources\Developers\Pages\EditDeveloper;
use App\Filament\Resources\Developers\Pages\ListDevelopers;
use App\Filament\Resources\Developers\Schemas\DeveloperForm;
use App\Filament\Resources\Developers\Tables\DevelopersTable;
use App\Models\Developer;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class DeveloperResource extends Resource
{
    protected static ?string $model = Developer::class;

    protected static ?string $recordTitleAttribute = 'Developer';
    protected static string|\UnitEnum|null $navigationGroup = '#';
    protected static string|BackedEnum|null $navigationIcon = Heroicon::CheckBadge;
    protected static ?int $navigationSort = 4;

    protected static ?string $navigationLabel = 'Developer';
    protected static ?string $modelLabel = 'Data Developer';
    protected static ?string $pluralModelLabel = 'Developer';

    public static function form(Schema $schema): Schema
    {
        return DeveloperForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return DevelopersTable::configure($table);
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
            'index' => ListDevelopers::route('/'),
            'create' => CreateDeveloper::route('/create'),
            'edit' => EditDeveloper::route('/{record}/edit'),
        ];
    }
}
