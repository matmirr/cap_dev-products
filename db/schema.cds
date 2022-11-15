namespace com.matmir;

using {
    cuid,
    managed
} from '@sap/cds/common';

/**
 * TYPES
 */

type Address {
    Street     : String;
    City       : String;
    State      : String(2);
    PostalCode : String(5);
    Country    : String(3);
};

type Dec : Decimal(16, 2);

/**
 * ENTITIES
 */

context materials {

    entity Products : cuid, managed {
        createdAt        : Timestamp  @cds.on.insert : $now;
        modifiedAt       : Timestamp  @cds.on.insert : $now  @cds.on.update : $now;
        Name             : localized String not null;
        Description      : localized String;
        ImageUrl         : String;
        ReleaseDate      : DateTime default $now;
        DiscontinuedDate : DateTime;
        Price            : Dec;
        Height           : type of Price;
        Width            : type of Price;
        Depth            : type of Price;
        Quantity         : type of Price;
        Supplier         : Association to one sales.Suppliers;
        UnitOfMeasure    : Association to one UnitOfMeasures;
        Currency         : Association to one Currencies;
        DimensionUnit    : Association to one DimensionUnits;
        Category         : Association to one Categories;
        SalesData        : Association to many sales.SalesData
                               on SalesData.Product = $self;
        Reviews          : Association to many sales.ProductReviews
                               on Reviews.Product = $self;
    };

    entity Categories {
        key ID   : String(1);
            Name : localized String;
    };

    entity StockAvailability {
        key ID          : Integer;
            Description : localized String;
            Product     : Association to Products
    };

    entity Currencies {
        key ID          : String(3);
            Description : localized String;
    };

    entity UnitOfMeasures {
        key ID          : String(2);
            Description : localized String;
    };

    entity DimensionUnits {
        key ID          : String(2);
            Description : localized String;
    };

};

context sales {

    entity Suppliers : cuid, managed {
        Name    : materials.Products:Name;
        Address : Address;
        Email   : String;
        Phone   : String;
        Fax     : String;
        Product : Association to many materials.Products
                      on Product.Supplier = $self;
    };

    entity Months {
        key ID               : String(2);
            Description      : localized String;
            ShortDescription : localized String(3);
    };

    entity SalesData : cuid {
        DeliveryDate  : DateTime;
        Revenue       : Decimal(16, 2);
        Product       : Association to one materials.Products;
        Currency      : Association to one materials.Currencies;
        DeliveryMonth : Association to one Months;
    };

    entity ProductReviews : cuid {
        Product   : Association to one materials.Products;
        Name      : String;
        Rating    : Integer;
        Comment   : String;
        createdAt : DateTime;
    };

};

context reports {

    entity AverageRating as
        select from matmir.sales.ProductReviews {
            Product.ID  as ProductId,
            avg(Rating) as AverageRating : Decimal(16, 2)
        }
        group by
            Product.ID;

    entity Products      as
        select from matmir.materials.Products
        mixin {
            ToStockAvailibilty : Association to matmir.materials.StockAvailability
                                     on ToStockAvailibilty.ID = $projection.StockAvailability;
            ToAverageRating    : Association to AverageRating
                                     on ToAverageRating.ProductId = ID;
        }

        into {
            *,
            ToAverageRating.AverageRating as Rating,
            case
                when
                    Quantity >= 8
                then
                    3
                when
                    Quantity > 0
                then
                    2
                else
                    1
            end                           as StockAvailability : Integer,
            ToStockAvailibilty
        }
}
