(function( window, undefined ) {

var document = window.document,
	version = '0.0.1',

	_PageTransitions = window.pageTransitions ,	//����ͻ����

	_pt = window.pt,							//����ͻ����

	PageTransitions = function( config ) {
		return new PageTransitions.prototype.init( config );
	};

PageTransitions.prototype = {

	version: version,
	
	constructor: PageTransitions,
	
	element: '.pt',						//ִ��ҳ����ɵ������Ԫ��,ע��˴�����.
			
	index: '-1',						//Ĭ����ʾ��ҳ��
	
	count: '0',							//ҳ������

	loop: 'false',						//�Ƿ�֧��ѭ����Ĭ��Ϊ����ѭ��

	direction: 'vertical',				//ҳ����ɷ���Ĭ��Ϊ��ֱ����

	transitionType: 'slide',			//ҳ��������ͣ�Ĭ��Ϊ slide ���� 

	selectors: {
		ptPage: 'pt-page',				//����ҳ������
		current: 'pt-page-current' 		//��ǰ��ʾҳ
	}, 

	//��ʼ��
	init: function( config ) {
		var self = this,
			selectors = self.selectors;

		/*** ��ʼ���������� ***/
		if( config && $.isPlainObject( config ) ) {
			for( var option in config ) {
				if( option in self ) {	//ֻ����PageTransitions���е���������
					this[ option ] = config[ option ];
				}
			}
		}

		//��ʼ��DOM, ҳ���������ҳ��
		/*** ��Ҫ����ִ�У�������Ҫʹ��$element��ע���¼� **/
		self.$element = $( self.element );
		self.$ptPages = self.$element.children( '.' + selectors.ptPage );
		self.count = self.$ptPages.length;

		/*** ��ʼ����ǰ�����µĹ��ɶ��������� ***/
		self.initTransitionClassName();

		/*** ��ʼ�����������¼������Ƿ����ڶ������Ƿ�֧��css���� ***/
		self.initAnimEndEventName();

		//�����ʼҳΪ -1 �� count > 0 ,����ʼҳ��Ϊ0
		if( self.count > 0 && self.index == -1 ) {
			self.index = 0 ;
		}

		//��ʼ������ҳ��(����ԭʼclass�б�)
		self.initPtPages( self.$ptPages );

		//Ϊ���й���ҳ���swipe�¼�
		self.bindSwipeEvent();

		//����this
		return this;

	},

	//αon����������this�ϵ���onʱ����Ϊ��ҳ�����Ԫ���ϵ���on�������¼�
	on: function( event, callback ) {
		this.$element.on( event, callback );
	},

	//αtrigger����������this�ϵ���triggerʱ����Ϊ��ҳ�����Ԫ���ϵ���trigger�������¼�
	trigger: function( event ) {
		this.$element.trigger( event );
	},

	/* �л�ҳ�� */
	/*
	 ** parameter **
	 * @inIndex: ����ҳ��ţ������л������ҳ�� *
	 * @type����ȱʡ��: �жϵ�ǰ��������������һҳ������һҳ  *
	*/
	switch: function( inIndex, type ) {
		var self = this;
		
		/*** ֧�ָ���switch ***/
		if( inIndex < 0 ) {
			inIndex += self.count;
		}

		/* switch���ݴ��� */
		//�������inIndex����ҳ������ʱ������false
		if( inIndex > self.count ) return false;

		//������ڽ��ж������������л�ҳ�涯��
		if( self.isAnimating ) return false;

		var outIndex = self.index,
			//type��������ǰ�������󣨲���ֻ����һҳ��һҳ��
			type = ( type != undefined ) ? type : ( outIndex < inIndex ) ? 'next' : 'prev',
			
			$outPage = $( self.$ptPages[ outIndex ] ),
			$inPage = $( self.$ptPages[ inIndex ] ),
			direction = self.direction;

		//�޸Ķ���״̬
		self.isAnimating = true;
		// �޸ĵ�ǰѡ����
		self.index = inIndex;

		/* ��⶯������ */
		//Ϊ$outPage��$inPageҳ�󶨶��������¼�
		$outPage.on( self.animEndEventName, function() {
			$outPage.off( self.animEndEventName );
			self.endOutPage = true;
			if( self.endInPage ) {
				self.onEndAnimation( $outPage, $inPage );
			}
		});
		$inPage.on( self.animEndEventName, function() {
			$inPage.off( self.animEndEventName );
			self.endInPage = true;
			if( self.endOutPage ) {
				self.onEndAnimation( $outPage, $inPage );
			}
		});
		//�����֧��css�������ֶ����ö�����������
		if( !self.support ) {
			self.onEndAnimation( $outPage, $inPage );
		}

		//����direction �� type ��Ӷ���
		if( direction == 'vertical' ) {
			if( type == 'next' ) {
				$outPage.addClass( self.upOutClass );
				$inPage.addClass( self.upInClass + ' pt-page-current' );
			}else if( type == 'prev' ) {
				$outPage.addClass( self.downOutClass );
				$inPage.addClass( self.downInClass + ' pt-page-current' );
			}
		}else if( direction == 'horizonal') {
			if( type == 'next' ) {
				$outPage.addClass( self.leftOutClass );
				$inPage.addClass( self.leftInClass + ' pt-page-current' );
			}else if( type == 'prev' ) {
				$outPage.addClass( self.rightOutClass );
				$inPage.addClass( self.rightInClass + ' pt-page-current' );
			}
		}
	},

	/* �л�����һ�����ɹ�����true */
	prev: function() {
		var prev = this.getPrevIndex();
		//prev == -1 ʱ ��������
		if( prev != -1 ) {
			this.switch(prev, 'prev');
			return true;
		}
		return false;
	},

	/* �л�����һ�����ɹ�����true */
	next: function() {
		var next = this.getNextIndex();
		//next == -1 ʱ ��������
		if( next != -1 ) { 	
			this.switch(next, 'next');
			return true;
		}
		return false;
	},

	/* ��ȡ��һ��ѡ�� */
	getPrevIndex: function() {
		var from = this.index,
			to = -1,
			count = this.count;

		//��ѭ��ʱ��������һ��ѡ��index
		if( this.loop ) {
			to = (from - 1 + count) % count;
		}
		//����ѭ��ʱ������index(���ɳ�����Χ)
		else if( (from - 1) >= 0 ) {
			to = from - 1;
		}

		return to;
	},

	/* ��ȡ��һ��ѡ�� */
	getNextIndex: function() {
		var from = this.index,
			to = -1,
			count = this.count;

		//��ѭ��ʱ��������һ��ѡ��index
		if( this.loop ) {
			to = ( from + 1 ) % count;
		}
		//����ѭ��ʱ������index(���ɳ�����Χ)
		else if( ( from + 1 ) < count ) {
			to = from + 1;
		}

		return to;
	},

	/* ��������ʱ���� */
	onEndAnimation: function( $outPage, $inPage ) {
		this.endOutPage = false;
		this.endInPage = false;
		this.resetPage( $outPage, $inPage );
		this.isAnimating = false;
		this.trigger( 'afterSwitch' );
	},

	/* ��������������ҳ��class�б� */
	resetPage: function( $outPage, $inPage ) {
		$outPage.attr( 'class', $outPage.data('originalClassList') );
		$inPage.attr( 'class', $inPage.data('originalClassList') + ' pt-page-current' );
	},

	/* Ϊ����ҳ�����ҳ���swipe�¼� */
	bindSwipeEvent: function() {
		var self = this,
			direction = self.direction;

		/*
			���ֻ�������£�touchmove�¼�����Ҫ����ֹdocument����touchmove�¼���������Ԫ���ϴ���touchmove�¼�
		 */
		document.addEventListener('touchmove', function (event) {
                       event.preventDefault();
                    }, false);

		if( direction == 'vertical' ) {
		    self.$ptPages.on({
		        swipeDown: function( e ) {
		            e.stopPropagation();
		            self.prev();
		        },
		        swipeUp: function( e ) {
		            e.stopPropagation();
		            self.next();
		        }
		    });
		}else if( direction == 'horizonal' ) {
		    self.$ptPages.on({
		        swipeRight: function( e ) {
		            e.stopPropagation();
		            self.prev();
		        },
		        swipeLeft: function( e ) {
		            e.stopPropagation();
		            self.next();
		        }
		    });
		}
	},

	/* ��ʼ������ҳ�� */
	/* �洢ҳ���ԭʼclass�б� ���ɽ�����ָ�ԭ�б� */
	initPtPages: function( $pages ) {
		//�����й���ҳ���ԭʼclass�б���
		$pages.each(function() {
			var $page = $( this );
			$page.data( 'originalClassList', $page.attr( 'class' ) );
		});
		//����ǰҳ���class 
		$pages.eq( this.index ).addClass( this.selectors.current );
	},
	
	/*** �ж��Ƿ�֧��css�������Ƿ����ڽ��ж������뿪ҳ�����Ƿ���ɡ�����ҳ�����Ƿ���ɡ��Լ����ö��������¼��� ***/
	initAnimEndEventName: function() {
		var self = this;
		var animEndEventNames = {
			'WebkitAnimation' : 'webkitAnimationEnd',
			'OAnimation' : 'oAnimationEnd',
			'msAnimation' : 'MSAnimationEnd',
			'animation' : 'animationend'
		};
		self.animEndEventName = animEndEventNames[ Modernizr.prefixed( 'animation' ) ];
		self.isAnimating = false;
		self.endOutPage = false;
		self.endInPage = false;
		self.support = Modernizr.cssanimations;
		
	},

	/* �˴����뷱�� ��Ҫ�Ǹ��ݲ�ͬ�Ĺ������� ���ɹ��ɶ���class ������ */
	/* ����transitionType��direction��ֵ ����ҳ�����Class���� */
	initTransitionClassName: function() {
		var self = this,
			transitionType = self.transitionType,
			direction = self.direction;
		switch( transitionType ) {
			/* ���뻮�� */
			case 'slide':
				if( direction == 'vertical' ) {
					//���ϻ���ʱ��������뿪ҳ���class           
					self.upInClass = 'pt-page-moveFromBottom';
					self.upOutClass = 'pt-page-moveToTop';
					//���»���ʱ��������뿪ҳ���class
					self.downInClass = 'pt-page-moveFromTop';
					self.downOutClass = 'pt-page-moveToBottom';
				}else if( direction == 'horizonal' ) {
					//���󻬶�ʱ��������뿪ҳ���class
					self.leftInClass = 'pt-page-moveFromRight';
					self.leftOutClass = 'pt-page-moveToLeft';
					//���һ���ʱ��������뿪ҳ���class
					self.rightInClass = 'pt-page-moveFromLeft';
					self.rightOutClass = 'pt-page-moveToRight';
				}
				break;
			/* �������� */
			case 'fadeOutSlideIn':
				if( direction == 'vertical' ) {
					//���ϻ���ʱ��������뿪ҳ���class
					self.upInClass = 'pt-page-moveFromBottom pt-page-ontop';
					self.upOutClass = 'pt-page-fade';
					//���»���ʱ��������뿪ҳ���class
					self.downInClass = 'pt-page-moveFromTop pt-page-ontop';
					self.downOutClass = 'pt-page-fade';
				}else if( direction == 'horizonal' ) {
					//���󻬶�ʱ��������뿪ҳ���class
					self.leftInClass = 'pt-page-moveFromRight pt-page-ontop';
					self.leftOutClass = 'pt-page-fade';
					//���һ���ʱ��������뿪ҳ���class
					self.rightInClass = 'pt-page-moveFromLeft pt-page-ontop';
					self.rightOutClass = 'pt-page-fade';
				}
				break;
			/* ���뵭�� */
			case 'fade':
				if( direction == 'vertical' ) {
					//���ϻ���ʱ��������뿪ҳ���class
					self.upInClass = 'pt-page-moveFromBottomFade';
					self.upOutClass = 'pt-page-moveToTopFade';
					//���»���ʱ��������뿪ҳ���class
					self.downInClass = 'pt-page-moveFromTopFade';
					self.downOutClass = 'pt-page-moveToBottomFade';
				}else if( direction == 'horizonal' ) {
					//���󻬶�ʱ��������뿪ҳ���class
					self.leftInClass = 'pt-page-moveFromRightFade';
					self.leftOutClass = 'pt-page-moveToLeftFade';
					//���һ���ʱ��������뿪ҳ���class
					self.rightInClass = 'pt-page-moveFromLeftFade';
					self.rightOutClass = 'pt-page-moveToRightFade';
				}
				break;
			/* �������� */
			case 'easingOutSlideIn':
				if( direction == 'vertical' ) {
					//���ϻ���ʱ��������뿪ҳ���class
					self.upInClass = 'pt-page-moveFromBottom';
					self.upOutClass = 'pt-page-moveToTopEasing pt-page-ontop';
					//���»���ʱ��������뿪ҳ���class
					self.downInClass = 'pt-page-moveFromTop';
					self.downOutClass = 'pt-page-moveToBottomEasing pt-page-ontop';
				}else if( direction == 'horizonal' ) {
					//���󻬶�ʱ��������뿪ҳ���class
					self.leftInClass = 'pt-page-moveFromRight';
					self.leftOutClass = 'pt-page-moveToLeftEasing pt-page-ontop';
					//���һ���ʱ��������뿪ҳ���class
					self.rightInClass = 'pt-page-moveFromLeft';
					self.rightOutClass = 'pt-page-moveToRightEasing pt-page-ontop';
				}
				break;
			/* ��С�˳� ���� */
			case 'scaleDownOutSlideIn':
				if( direction == 'vertical' ) {
					//���ϻ���ʱ��������뿪ҳ���class
					self.upInClass = 'pt-page-moveFromBottom pt-page-ontop';
					self.upOutClass = 'pt-page-scaleDown';
					//���»���ʱ��������뿪ҳ���class
					self.downInClass = 'pt-page-moveFromTop pt-page-ontop';
					self.downOutClass = 'pt-page-scaleDown';
				}else if( direction == 'horizonal' ) {
					//���󻬶�ʱ��������뿪ҳ���class
					self.leftInClass = 'pt-page-moveFromRight pt-page-ontop';
					self.leftOutClass = 'pt-page-scaleDown';
					//���һ���ʱ��������뿪ҳ���class
					self.rightInClass = 'pt-page-moveFromLeft pt-page-ontop';
					self.rightOutClass = 'pt-page-scaleDown';
				}
				break;
			/* ��С���롢�˳� */
			case 'scaleDown':
				if( direction == 'vertical' ) {
					self.upInClass = self.downInClass = 'pt-page-scaleUpDown pt-page-delay300';
					self.upOutClass = self.downOutClass = 'pt-page-scaleDown';
				}else if( direction == 'horizonal' ) {
					self.leftInClass = self.rightInClass = 'pt-page-scaleUpDown pt-page-delay300';
					self.leftOutClass = self.rightOutClass = 'pt-page-scaleDown'
				}
				break;
			/* �Ŵ���롢�˳� */
			case 'scaleUp':
				if( direction == 'vertical' ) {
					self.upInClass = self.downInClass = 'pt-page-scaleUp pt-page-delay300';
					self.upOutClass = self.downOutClass = 'pt-page-scaleDownUp';
				}else if( direction == 'horizonal' ) {
					self.leftInClass = self.rightInClass = 'pt-page-scaleUp pt-page-delay300';
					self.leftOutClass = self.rightOutClass = 'pt-page-scaleDownUp'
				}
				break;
			/* �Ŵ���� �����˳� */
			case 'scaleUpInSlideOut':
				if( direction == 'vertical' ) {
					//���ϻ���ʱ��������뿪ҳ���class
					self.upInClass = 'pt-page-scaleUp';
					self.upOutClass = 'pt-page-moveToTop pt-page-ontop';
					//���»���ʱ��������뿪ҳ���class
					self.downInClass = 'pt-page-scaleUp';
					self.downOutClass = 'pt-page-moveToBottom pt-page-ontop';
				}else if( direction == 'horizonal' ) {
					//���󻬶�ʱ��������뿪ҳ���class
					self.leftInClass = 'pt-page-scaleUp';
					self.leftOutClass = 'pt-page-moveToLeft pt-page-ontop';
					//���һ���ʱ��������뿪ҳ���class
					self.rightInClass = 'pt-page-scaleUp';
					self.rightOutClass = 'pt-page-moveToRight pt-page-ontop';
				}
				break;
			/* �Ŵ���롢��С�˳� */
			case 'scaleUpInScaleDownOut':
				if( direction == 'vertical' ) {
					self.upInClass = self.downInClass = 'pt-page-scaleUpCenter pt-page-delay400';
					self.upOutClass = self.downOutClass = 'pt-page-scaleDownCenter';
				}else if( direction == 'horizonal' ) {
					self.leftInClass = self.rightInClass = 'pt-page-scaleUpCenter pt-page-delay400';
					self.leftOutClass = self.rightOutClass = 'pt-page-scaleDownCenter'
				}
				break;
			/* �Ը�����ת�˳� �������� */
			case 'SlideInRotateOut':
				if( direction == 'vertical' ) {
					//���ϻ���ʱ��������뿪ҳ���class
					self.upInClass = 'pt-page-moveFromBottom pt-page-delay200 pt-page-ontop';
					self.upOutClass = 'pt-page-rotateBottomSideFirst';
					//���»���ʱ��������뿪ҳ���class
					self.downInClass = 'pt-page-moveFromTop pt-page-delay200 pt-page-ontop';
					self.downOutClass = 'pt-page-rotateTopSideFirst';
				}else if( direction == 'horizonal' ) {
					//���󻬶�ʱ��������뿪ҳ���class
					self.leftInClass = 'pt-page-moveFromRight pt-page-delay200 pt-page-ontop';
					self.leftOutClass = 'pt-page-rotateRightSideFirst';
					//���һ���ʱ��������뿪ҳ���class
					self.rightInClass = 'pt-page-moveFromLeft pt-page-delay200 pt-page-ontop';
					self.rightOutClass = 'pt-page-rotateLeftSideFirst';
				}
				break;
			/* ��ת���롢�˳� */
			case 'flip':
				if( direction == 'vertical' ) {
					//���ϻ���ʱ��������뿪ҳ���class
					self.upInClass = 'pt-page-flipInBottom pt-page-delay500';
					self.upOutClass = 'pt-page-flipOutTop';
					//���»���ʱ��������뿪ҳ���class
					self.downInClass = 'pt-page-flipInTop pt-page-delay500';
					self.downOutClass = 'pt-page-flipOutBottom';
				}else if( direction == 'horizonal' ) {
					//���󻬶�ʱ��������뿪ҳ���class
					self.leftInClass = 'pt-page-flipInRight pt-page-delay500';
					self.leftOutClass = 'pt-page-flipOutLeft';
					//���һ���ʱ��������뿪ҳ���class
					self.rightInClass = 'pt-page-flipInLeft pt-page-delay500';
					self.rightOutClass = 'pt-page-flipOutRight';
				}
				break;
			/* ��ת���� */
			/*********�˴������������ֱ���ĸ��ǵ���**********/
			case 'rotateFall':
				if( direction == 'vertical' ) {
					self.upInClass = self.downInClass = 'pt-page-scaleUp';
					self.upOutClass = self.downOutClass = 'pt-page-rotateFall pt-page-ontop';
				}else if( direction == 'horizonal' ) {
					self.leftInClass = self.rightInClass = 'pt-page-scaleUp';
					self.leftOutClass = self.rightOutClass = 'pt-page-rotateFall pt-page-ontop'
				}
				break;
			/* תȦ���롢�˳� */
			case 'rotateCircle':
				if( direction == 'vertical' ) {
					self.upInClass = self.downInClass = 'pt-page-rotateInNewspaper pt-page-delay500';
					self.upOutClass = self.downOutClass = 'pt-page-rotateOutNewspaper';
				}else if( direction == 'horizonal' ) {
					self.leftInClass = self.rightInClass = 'pt-page-rotateInNewspaper pt-page-delay500';
					self.leftOutClass = self.rightOutClass = 'pt-page-rotateOutNewspaper'
				}
				break;
			/* �������롢���Ŷ��� */
			case 'slideInPushOut':
				if( direction == 'vertical' ) {
					//���ϻ���ʱ��������뿪ҳ���class
					self.upInClass = 'pt-page-moveFromBottom';
					self.upOutClass = 'pt-page-rotatePushTop';
					//���»���ʱ��������뿪ҳ���class
					self.downInClass = 'pt-page-moveFromTop';
					self.downOutClass = 'pt-page-rotatePushBottom';
				}else if( direction == 'horizonal' ) {
					//���󻬶�ʱ��������뿪ҳ���class
					self.leftInClass = 'pt-page-moveFromRight';
					self.leftOutClass = 'pt-page-rotatePushLeft';
					//���һ���ʱ��������뿪ҳ���class
					self.rightInClass = 'pt-page-moveFromLeft';
					self.rightOutClass = 'pt-page-rotatePushRight';
				}
				break;
			/* ���Ŷ��롢���Ŷ��� */
			case 'pullInPushOut':
				if( direction == 'vertical' ) {
					//���ϻ���ʱ��������뿪ҳ���class
					self.upInClass = 'pt-page-rotatePullBottom pt-page-delay180';
					self.upOutClass = 'pt-page-rotatePushTop';
					//���»���ʱ��������뿪ҳ���class
					self.downInClass = 'pt-page-rotatePullTop pt-page-delay180';
					self.downOutClass = 'pt-page-rotatePushBottom';
				}else if( direction == 'horizonal' ) {
					//���󻬶�ʱ��������뿪ҳ���class
					self.leftInClass = 'pt-page-rotatePullRight pt-page-delay180';
					self.leftOutClass = 'pt-page-rotatePushLeft';
					//���һ���ʱ��������뿪ҳ���class
					self.rightInClass = 'pt-page-rotatePullLeft pt-page-delay180';
					self.rightOutClass = 'pt-page-rotatePushRight';
				}
				break;
			/* ���뻬�����롢�򿪶��� */
			case 'slideFadeInFoldOut':
				if( direction == 'vertical' ) {
					//���ϻ���ʱ��������뿪ҳ���class
					self.upInClass = 'pt-page-moveFromBottomFade';
					self.upOutClass = 'pt-page-rotateFoldTop';
					//���»���ʱ��������뿪ҳ���class
					self.downInClass = 'pt-page-moveFromTopFade';
					self.downOutClass = 'pt-page-rotateFoldBottom';
				}else if( direction == 'horizonal' ) {
					//���󻬶�ʱ��������뿪ҳ���class
					self.leftInClass = 'pt-page-moveFromRightFade';
					self.leftOutClass = 'pt-page-rotateFoldLeft';
					//���һ���ʱ��������뿪ҳ���class
					self.rightInClass = 'pt-page-moveFromLeftFade';
					self.rightOutClass = 'pt-page-rotateFoldRight';
				}
				break;
			/* �رն��롢���뻬������ */
			case 'foldInSlideFadeOut':
				if( direction == 'vertical' ) {
					//���ϻ���ʱ��������뿪ҳ���class
					self.upInClass = 'pt-page-rotateUnfoldBottom';
					self.upOutClass = 'pt-page-moveToTopFade';
					//���»���ʱ��������뿪ҳ���class
					self.downInClass = 'pt-page-rotateUnfoldTop';
					self.downOutClass = 'pt-page-moveToBottomFade';
				}else if( direction == 'horizonal' ) {
					//���󻬶�ʱ��������뿪ҳ���class
					self.leftInClass = 'pt-page-rotateUnfoldRight';
					self.leftOutClass = 'pt-page-moveToLeftFade';
					//���һ���ʱ��������뿪ҳ���class
					self.rightInClass = 'pt-page-rotateUnfoldLeft';
					self.rightOutClass = 'pt-page-moveToRightFade';
				}
				break;
			/* room���롢room���� */
			case 'room':
				if( direction == 'vertical' ) {
					//���ϻ���ʱ��������뿪ҳ���class
					self.upInClass = 'pt-page-rotateRoomTopIn';
					self.upOutClass = 'pt-page-rotateRoomTopOut pt-page-ontop';
					//���»���ʱ��������뿪ҳ���class
					self.downInClass = 'pt-page-rotateRoomBottomIn';
					self.downOutClass = 'pt-page-rotateRoomBottomOut pt-page-ontop';
				}else if( direction == 'horizonal' ) {
					//���󻬶�ʱ��������뿪ҳ���class
					self.leftInClass = 'pt-page-rotateRoomLeftIn';
					self.leftOutClass = 'pt-page-rotateRoomLeftOut pt-page-ontop';
					//���һ���ʱ��������뿪ҳ���class
					self.rightInClass = 'pt-page-rotateRoomRightIn';
					self.rightOutClass = 'pt-page-rotateRoomRightOut pt-page-ontop';
				}
				break;
			/* ħ�����롢ħ������ */
			case 'cube':
				if( direction == 'vertical' ) {
					//���ϻ���ʱ��������뿪ҳ���class
					self.upInClass = 'pt-page-rotateCubeTopIn';
					self.upOutClass = 'pt-page-rotateCubeTopOut pt-page-ontop';
					//���»���ʱ��������뿪ҳ���class
					self.downInClass = 'pt-page-rotateCubeBottomIn';
					self.downOutClass = 'pt-page-rotateCubeBottomOut pt-page-ontop';
				}else if( direction == 'horizonal' ) {
					//���󻬶�ʱ��������뿪ҳ���class
					self.leftInClass = 'pt-page-rotateCubeLeftIn';
					self.leftOutClass = 'pt-page-rotateCubeLeftOut pt-page-ontop';
					//���һ���ʱ��������뿪ҳ���class
					self.rightInClass = 'pt-page-rotateCubeRightIn';
					self.rightOutClass = 'pt-page-rotateCubeRightOut pt-page-ontop';
				}
				break;
			/* ���롢�ɳ� */
			case 'carousel':
				if( direction == 'vertical' ) {
					//���ϻ���ʱ��������뿪ҳ���class
					self.upInClass = 'pt-page-rotateCarouselTopIn';
					self.upOutClass = 'pt-page-rotateCarouselTopOut pt-page-ontop';
					//���»���ʱ��������뿪ҳ���class
					self.downInClass = 'pt-page-rotateCarouselBottomIn';
					self.downOutClass = 'pt-page-rotateCarouselBottomOut pt-page-ontop';
				}else if( direction == 'horizonal' ) {
					//���󻬶�ʱ��������뿪ҳ���class
					self.leftInClass = 'pt-page-rotateCarouselLeftIn';
					self.leftOutClass = 'pt-page-rotateCarouselLeftOut pt-page-ontop';
					//���һ���ʱ��������뿪ҳ���class
					self.rightInClass = 'pt-page-rotateCarouselRightIn';
					self.rightOutClass = 'pt-page-rotateCarouselRightOut pt-page-ontop';
				}
				break;
			/* ���뼷�� */
			/*********�˴������������ֱ���ĸ�����**********/
			case 'side':
				if( direction == 'vertical' ) {
					self.upInClass = self.downInClass = 'pt-page-rotateSidesIn pt-page-delay200';
					self.upOutClass = self.downOutClass = 'pt-page-rotateSidesOut';
				}else if( direction == 'horizonal' ) {
					self.leftInClass = self.rightInClass = 'pt-page-rotateSidesIn pt-page-delay200';
					self.leftOutClass = self.rightOutClass = 'pt-page-rotateSidesOut'
				}
				break;
		}
	}

};

PageTransitions.prototype.init.prototype = PageTransitions.prototype;

window.pt = window.PageTransitions = PageTransitions;

})(window);
