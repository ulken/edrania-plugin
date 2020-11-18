class HoverInfo
{
	constructor()
	{
		// Cache info to avoid 
		this.cache = [];
		this.ajaxRequest = null;
		this.hoverTimeout = null;

		// Init hover
		$('a').on('mouseenter', (event) => {
				// Wait 100 ms in case of user is hovering on multiple links in a short time
				this.hoverTimeout = setTimeout(() => {
					this.hover(event);
				}, 100);
			})
			.on('mouseleave', (event) => {
				clearTimeout(this.hoverTimeout);

				if (this.ajaxRequest !== null) {
					this.ajaxRequest.abort();
				}
				
				$('.chrome-plugin-info-box').remove();
			})
			.on('mousemove', (event) => {
				// Update position of info box
				this.mouseX = event.pageX;
				this.mouseY = event.pageY;
				this.setBoxPosition();
			});
	}

	/**
	 * Init hover boxes for 
	 */
	hover(event)
	{
		this.mouseX = event.pageX;
		this.mouseY = event.pageY;

		const $a = $(event.currentTarget);
		let href = $a.attr('href');
		let cacheHref = href;

		let type = '';

		// Check if link match weapon
		if (href.search('/Vendor/Display/') > -1 && edraniaConfig.hoverWeaponsActive) {
			type = 'weapon';			
		}
		else if (href === '/MyGlad/Profile/Attributes' && edraniaConfig.hoverAttributesActive) {
			type = 'attributes';
		}
		else if (href.search('/Profile/View/') > -1 && edraniaConfig.hoverPlayerActive) {
			type = 'player';
			href += '/Arsenal'
		}

		if (type === '') {
			return false;
		}

		if (this.cache[cacheHref] !== undefined) {
			if (type === 'weapon') {
				this.renderWeaponInfoBox(this.cache[cacheHref], true);
			}
			else if (type === 'attributes') {
				this.renderAttributesInfoBox(this.cache[cacheHref], true);
			}
			else if (type === 'player') {
				this.renderPlayerInfoBox(this.cache[cacheHref], true);
			}
		}
		else {
			this.ajaxRequest = $.get(href, (html) => {
				if (type === 'weapon') {
					this.cache[cacheHref] = this.renderWeaponInfoBox(html, false);
				}
				else if (type === 'attributes') {
					this.cache[cacheHref] = this.renderAttributesInfoBox(html, false);
				}
				else if (type === 'player') {
					this.cache[cacheHref] = this.renderPlayerInfoBox(html, false);
				}
			});
		}
	}

	/**
	 * Render the box
	 */
	renderBox(content)
	{
		const $div = $('<div class="chrome-plugin-info-box">');

		$div.html(content);

		$('body').prepend($div);

		this.setBoxPosition();
	}

	/**
	 * Set position of box
	 */
	setBoxPosition()
	{
		const $div = $('.chrome-plugin-info-box');
		let top = this.mouseY + 20;
		let left = this.mouseX + 20;

		if (this.mouseY + $div.height() + 20 > window.innerHeight) {
			top = this.mouseY - $div.height() - 20;
			left = this.mouseX - $div.height() - 20;
		}

		$div.css({
			'top': top,
			'left': left
		})
	}

	/**
	 * Render weapon info box
	 */
	renderWeaponInfoBox(html, fromCache)
	{
		let container;

		if (fromCache) {
			container = html;
		}
		else {
			container = $(html).find('.container');
			// Remove things we dont want to show
			container.find('.nav-arrow, .description, br:first, br:last').remove();
			container = container.html();
		}

		this.renderBox(container);

		return container;
	}

	/**
	 * Render attributes info box
	 */
	renderAttributesInfoBox(html, fromCache)
	{
		let container;

		if (fromCache) {
			container = html;
		}
		else {
			container = $(html).find('.container');
			// Rremove go back link
			container.find('td').each(function(){
				if ($(this).html() === '0') {
					$(this).parents('tr').remove();
				}
			});
			container = container.html();
		}

		this.renderBox(container);

		return container;
	}

	/**
	 * Render info about a player equipment
	 */
	renderPlayerInfoBox(html, fromCache)
	{
		let container;

		if (fromCache) {
			container = html;
		}
		else {
			container = $(html).find('.indent-2');
			//container = container.html();
		}

		this.renderBox(container);

		return container;
	}
}