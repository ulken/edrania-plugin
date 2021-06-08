class MyClan
{
	constructor()
	{
		this.initReplaceWorkDistrictWithMine();
	}

	initReplaceWorkDistrictWithMine()
	{
		console.log("Setting active:", edraniaConfig.replaceWorkDistrictWithMine);
		if (!edraniaConfig.replaceWorkDistrictWithMine) {
			return;
		}

		this.getMineUrl().then(this.replaceWorkDistrictWithMine);

		chrome.storage.onChanged.addListener((changes, namespace) => {
			console.log("Cached value changed:", namespace, changes);
			if (namespace !== 'sync' || !('edraniaCache' in changes)) {
				return;
			}

			const {newValue} = changes.edraniaCache;
			console.log("New cached value:", newValue);

			if (newValue && newValue.mineUrl) {
				console.log("New mine URL:", newValue.mineUrl);
				this.replaceWorkDistrictWithMine(newValue.mineUrl);
			}
		});
	}

	getMineUrl()
	{
		const deferred = $.Deferred();

		chrome.storage.sync.get('edraniaCache', ({edraniaCache}) => {
			// stale while revalidate
			if (typeof edraniaCache.mineUrl !== 'undefined') {
				console.log("Resolving with cached value:", edraniaCache.mineUrl);
				deferred.resolve(edraniaCache.mineUrl);
			}

			profile.getClanUrl().then(clanUrl => {
				console.log("Got clan URL:", clanUrl);
				if (clanUrl === null) {
					delete edraniaCache.mineUrl;
					chrome.storage.sync.set({edraniaCache});
					deferred.reject();
					return;
				}

				$.get(`${clanUrl}/Buildings`).then(buildings => {
					console.log("Buildings HTML length:", buildings.length);
					const mineUrl = $(buildings)
						.find('#centerContent table')
						.find('tr:contains("Gruva"), tr:contains("Mine")')
						.find('td:nth(4) a')
						.attr('href');
						console.log("Mine URL:", mineUrl);

					if (
						/^\/Clan\/\d+\/Buildings\/\d+$/.test(mineUrl) && 
						mineUrl !== edraniaCache.mineUrl
					) {
						console.log("Caching new mine URL:", mineUrl);
						chrome.storage.sync.set({edraniaCache: {...edraniaCache, mineUrl}});
						deferred.resolve(mineUrl);
					}
				});
			});
		});

		return deferred.promise();
	}

	replaceWorkDistrictWithMine(mineUrl)
	{
		console.log("Replacing work district with mine URL:", mineUrl);
		$('#leftSideBar a[href="/Work"]')
			.attr('href', mineUrl)
			.text('Gruva')
	}
}
