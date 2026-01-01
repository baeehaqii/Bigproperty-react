<?php

namespace App\Filament\Resources\Visitors;

use App\Filament\Resources\Visitors\Pages\CreateVisitor;
use App\Filament\Resources\Visitors\Pages\EditVisitor;
use App\Filament\Resources\Visitors\Pages\ListVisitors;
use App\Filament\Resources\Visitors\Schemas\VisitorForm;
use App\Filament\Resources\Visitors\Tables\VisitorsTable;
use App\Models\Visitor;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class VisitorResource extends Resource
{
    protected static ?string $model = Visitor::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::Eye;
    protected static ?string $navigationLabel = 'Visitor';
    protected static string|\UnitEnum|null $navigationGroup = '#';
    protected static ?int $navigationSort = 3;

    protected static ?string $modelLabel = 'Data Visitor';
    protected static ?string $pluralModelLabel = 'Visitor';
    protected static ?string $recordTitleAttribute = 'Visitor';

    public static function form(Schema $schema): Schema
    {
        return VisitorForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return VisitorsTable::configure($table);
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
            'index' => ListVisitors::route('/'),
            'create' => CreateVisitor::route('/create'),
            'edit' => EditVisitor::route('/{record}/edit'),
        ];
    }
}
