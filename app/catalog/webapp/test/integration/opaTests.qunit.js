sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'matmir/catalog/test/integration/FirstJourney',
		'matmir/catalog/test/integration/pages/ProductsList',
		'matmir/catalog/test/integration/pages/ProductsObjectPage',
		'matmir/catalog/test/integration/pages/ReviewsObjectPage'
    ],
    function(JourneyRunner, opaJourney, ProductsList, ProductsObjectPage, ReviewsObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('matmir/catalog') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheProductsList: ProductsList,
					onTheProductsObjectPage: ProductsObjectPage,
					onTheReviewsObjectPage: ReviewsObjectPage
                }
            },
            opaJourney.run
        );
    }
);