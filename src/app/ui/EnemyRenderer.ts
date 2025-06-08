import { AnimatedSprite, Assets, Container, Particle, ParticleContainer, Texture } from "pixi.js";
import { AnimatedEnemy } from "../game/enemies/AnimatedEnemy";
import { Attack } from "../game/attacks/Attacks";
import { animate } from "motion";

export class EnemyRenderer extends Container {
  private enemy?: AnimatedEnemy;

  private enemySprite: AnimatedSprite;

  private particleContainer: ParticleContainer;

  private internalWidth: number = 32;
  private internalHeight: number = 32;

  public constructor() {
    super();

    this.enemySprite = new AnimatedSprite([Texture.EMPTY]);
    this.enemySprite.loop = true;
    this.enemySprite.animationSpeed = 0.15;
    this.addChild(this.enemySprite);

    this.particleContainer = new ParticleContainer({
      dynamicProperties: {
        position: true,
        color: true,
      },
    });

    this.addChild(this.particleContainer);
  }

  public resize(width: number, height: number): void {
    // Resize the enemy sprite to fit the internal dimensions
    this.enemySprite.width = this.internalWidth;
    this.enemySprite.height = this.internalHeight;

    // Center the enemy sprite within the container
    this.enemySprite.x = (width - this.enemySprite.width) / 2;
    this.enemySprite.y = (height - this.enemySprite.height) / 2;
  }

  public stopAnimation(): void {
    this.enemySprite.stop();
  }

  public startAnimation(): void {
    this.enemySprite.play();
  }

  public restartAnimation(): void {
    this.enemySprite.gotoAndPlay(0);
  }

  public showDeathAnimation(): void {
    this.createParticleEffect();
  }

  public setEnemy(enemy: AnimatedEnemy): void {
    // If the enemy is the same, do nothing
    if (this.enemy === enemy) return;

    // Set the new enemy and sprite sheet
    this.enemy = enemy;
    this.enemySprite.textures = Object.values(Assets.get(enemy.getSpriteSheetResource()).textures).filter((t): t is Texture => t instanceof Texture);
  }

  public setAttack(attack: Attack): void {
    if (!this.enemy) return;

    // Calculate the animation speed based on the BPM
    const frameCount = this.enemySprite.textures.length;
    const attackSeconds = (attack.getDuration() * 60) / attack.getBpm();
    this.enemySprite.animationSpeed = frameCount / (attackSeconds * 60);
  }

  private createParticleEffect(): void {
    this.particleContainer.removeParticles();
    const particleTexture = Texture.from("enemyDeathParticles.png");
    for (let i = 0; i < 50; i++) {
      const particle = new Particle(particleTexture);
      particle.x = this.enemySprite.x + ((Math.random() + 0.5) * this.enemySprite.width) / 2;
      particle.y = this.enemySprite.y + ((Math.random() + 0.5) * this.enemySprite.height) / 2;
      particle.scaleX = Math.random() * 0.2 + 0.5;
      particle.scaleY = particle.scaleX;
      particle.rotation = Math.random() * Math.PI * 2;
      particle.alpha = 0;
      this.particleContainer.addParticle(particle);

      animate(
        particle,
        {
          x: particle.x + (Math.random() - 0.5) * 20,
          y: particle.y + (Math.random() - 0.5) * 20,
          alpha: [0, 1, 0.75, 0.5, 0.25, 0],
        },
        {
          duration: 1.2 + Math.random() * 0.5,
          ease: "easeOut",
          onComplete: () => {
            this.particleContainer.removeParticle(particle);
          },
        },
      );
    }
  }
}
