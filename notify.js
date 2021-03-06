YAHOO.namespace("lacuna");

if (typeof YAHOO.lacuna.Notify == "undefined" || !YAHOO.lacuna.Notify) {
	
(function(){
	var Lang = YAHOO.lang,
		Util = YAHOO.util,
		Dom = Util.Dom,
		Event = Util.Event,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game,
		Lib = Lacuna.Library;
		
	var Notify = function(){
        this.incoming_own = {};
        this.num_incoming_own = {};
        this.incoming_ally = {};
        this.num_incoming_ally = {};
        this.incoming_enemy = {};
        this.num_incoming_enemy = {};
	};
	Notify.prototype = {
		_createDisplay : function() {
			if(!this.Display) {
				var container = document.createElement("div");
				container.id = "notify";
				Dom.addClass(container, Lib.Styles.HIDDEN);
				Dom.addClass(container, "nofooter");
				container.innerHTML = this._getHtml();
				document.body.insertBefore(container, document.body.firstChild);
				
				this.Display = new YAHOO.widget.Panel("notify", {
					constraintoviewport:true,
					visible:false,
					draggable:true,
					effect:Game.GetContainerEffect(),
					close:false,
					underlay:false,
					modal:false,
					width:"180px",
					context:["header","tr","br", ["beforeShow", "windowResize"], [0,40]]
				});
				this.Display.renderEvent.subscribe(function(){
					this.notifyList = Dom.get('notifyList');
					this.notify = Dom.get("notify");
					
					Dom.removeClass(this.notify, Lib.Styles.HIDDEN);
				});
				this.Display.showEvent.subscribe(function(){
					Dom.setStyle(this.notifyList.parentNode, "max-height", (Game.GetSize().h - 125) + "px");
				});
				this.Display.render();
			}
		},
		_getHtml : function() {
			return [
			'	<div class="hd" style="background:transparent;">Incoming Ships!</div>',
			'	<div class="bd" style="background: url(',Lib.AssetUrl,'ui/transparent_black.png) repeat scroll 0pt 0pt transparent;">',
			'		<div style="overflow:auto;">',
			'			<ul id="notifyList"></ul>',
			'		</div>',
			'	</div>'
			].join('');
		},
		_updating : function() {
			var list = this.Display.notifyList;
            var incoming_own = this.incoming_own[this.planetId] || [],
                incoming_ally = this.incoming_ally[this.planetId] || [],
                incoming_enemy = this.incoming_enemy[this.planetId] || [],
                num_incoming_own = this.num_incoming_own[this.planetId] || 0,
                num_incoming_ally = this.num_incoming_ally[this.planetId] || 0,
                num_incoming_enemy = this.num_incoming_enemy[this.planetId] || 0;
                arr = [];
            if(num_incoming_enemy > 0) {
                arr = arr.concat(['<li><span style="color:#fff">',num_incoming_enemy,' incoming enemy ships!</span></li>']);
                var serverTime = Lib.getTime(Game.ServerData.time),
                    len = incoming_enemy.length;
                for(var s=0; s<len; s++) {
                    var ship = incoming_enemy[s],
                    ms = Lib.getTime(ship.date_arrives) - serverTime,
                    arrTime;
                    if(ms > 0) {
                        arrTime = Lib.formatMillisecondTime(ms);
                    }
                    else {
                        arrTime = 'Overdue ' + Lib.formatMillisecondTime(-ms);
                    }
                    arr = arr.concat(['<li><span style="color:#fff;">',arrTime,'</span></li>']);
                }
            }
            if(num_incoming_ally > 0) {
                arr = arr.concat(['<li><span style="color:#b0b">',num_incoming_ally,' incoming ally ships</span></li>']);
                var serverTime = Lib.getTime(Game.ServerData.time),
                    len = incoming_ally.length;
                for(var s=0; s<len; s++) {
                    var ship = incoming_ally[s],
                    ms = Lib.getTime(ship.date_arrives) - serverTime,
                    arrTime;
                    if(ms > 0) {
                        arrTime = Lib.formatMillisecondTime(ms);
                    }
                    else {
                        arrTime = 'Overdue ' + Lib.formatMillisecondTime(-ms);
                    }
                    arr = arr.concat(['<li><span style="color:#b0b;">',arrTime,'</span></li>']);
                }
            }
            if(num_incoming_own > 0) {
                arr = arr.concat(['<li><span style="color:#0f0">',num_incoming_own,' incoming own ships</span></li>']);
                var serverTime = Lib.getTime(Game.ServerData.time),
                    len = incoming_own.length;
                for(var s=0; s<len; s++) {
                    var ship = incoming_own[s],
                    ms = Lib.getTime(ship.date_arrives) - serverTime,
                    arrTime;
                    if(ms > 0) {
                        arrTime = Lib.formatMillisecondTime(ms);
                    }
                    else {
                        arrTime = 'Overdue ' + Lib.formatMillisecondTime(-ms);
                    }
                    arr = arr.concat(['<li><span style="color:#0f0;">',arrTime,'</span></li>']);
                }
            }
			
			list.innerHTML = arr.join('');
			if(num_incoming_own + num_incoming_ally + num_incoming_enemy == 0) {
				Game.onTick.unsubscribe(this._updating);
				delete this.subscribed;
                this.incoming_own = {};
                this.num_incoming_own = {};
                this.incoming_ally = {};
                this.num_incoming_ally = {};
                this.incoming_enemy = {};
                this.num_incoming_enemy = {};
				this.Hide();
			}
			else {
				this.Display.show();
			}
		},
        Load : function(planet) {
            var incoming_own        = planet.incoming_own_ships || [],
                incoming_ally       = planet.incoming_ally_ships || [],
                incoming_enemy      = planet.incoming_enemy_ships || [],
                num_incoming_own    = planet.num_incoming_own || 0,
                num_incoming_ally   = planet.num_incoming_ally || 0,
                num_incoming_enemy  = planet.num_incoming_enemy || 0;
                planet_num_own      = this.num_incoming_own[planet.id] || 0;
                planet_num_ally     = this.num_incoming_ally[planet.id] || 0;
                planet_num_enemy    = this.num_incoming_enemy[planet.id] || 0;

            if(num_incoming_enemy + num_incoming_ally + num_incoming_own != planet_num_enemy + planet_num_ally + planet_num_enemy) {
                this._createDisplay();
                this.incoming_own[planet.id] = incoming_own;
                this.num_incoming_own[planet.id] = num_incoming_own;
                this.incoming_ally[planet.id] = incoming_ally;
                this.num_incoming_ally[planet.id] = num_incoming_ally;
                this.incoming_enemy[planet.id] = incoming_enemy;
                this.num_incoming_enemy[planet.id] = num_incoming_enemy;
                this.planetId = planet.id;

                if(!this.subscribed) {
                    Game.onTick.subscribe(this._updating, this, true);
                    this.subscribed = 1;
                }
                this.Display.show();
                this.Display.bringToTop();
            }
        },

		Show : function(planetId) {
			this.planetId = planetId;
			if(this.Display) {
				if(this.subscribed && (this.num_incoming_own[planetId] + this.num_incoming_ally[planetId] + this.num_incoming_enemy[planetId] > 0)) {
					this.Display.show();
					this.Display.bringToTop();
				}
				else {
					this.Display.hide();
				}
			}
		},
		Hide : function() {
			if(this.Display) {
				this.Display.hide();
			}
			delete this.planetId;
		}
	};
	
	Lacuna.Notify = new Notify();
		
})();
YAHOO.register("notify", YAHOO.lacuna.Notify, {version: "1", build: "0"}); 

}
// vim: noet:ts=4:sw=4
